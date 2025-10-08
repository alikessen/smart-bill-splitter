import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Users, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { BillBreakdown, SplitResult, MenuItem, GuestBreakdown } from '../types';
import apiClient from '../api/client';
import SplitOptions, { SplitMethod } from '../components/SplitOptions';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { useSearchParams } from "react-router-dom";

export default function Split() {
  const navigate = useNavigate();
  const [bill, setBill] = useState<BillBreakdown | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');
  const [splitResult, setSplitResult] = useState<SplitResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("tableId");

  const [serviceEnabled, setServiceEnabled] = useState(() => {
    const saved = localStorage.getItem(`serviceEnabled_${tableId}`);
    return saved ? JSON.parse(saved) : true;
  });

  const [tipRate, setTipRate] = useState(() => {
    const saved = localStorage.getItem(`tipRate_${tableId}`);
    return saved ? parseFloat(saved) : 0.10;
  });


  // Redirect if no table ID
  if (!tableId) {
    toast.error("No table selected!");
    navigate("/tables");
    return null;
  }

  // Equal split
  const [numGuests, setNumGuests] = useState(2);

  // Amount split
  const [guests, setGuests] = useState([
    { name: 'Guest 1', amount: 0 },
    { name: 'Guest 2', amount: 0 }
  ]);

  // Item split
  const [itemSplitGuests, setItemSplitGuests] = useState<string[]>([]);
  const [itemSplitStep, setItemSplitStep] = useState<'guests' | 'items'>('guests');
  const [itemAssignments, setItemAssignments] = useState<Record<string, string[]>>({});
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    if (!tableId) return;
    localStorage.setItem(`serviceEnabled_${tableId}`, JSON.stringify(serviceEnabled));
    localStorage.setItem(`tipRate_${tableId}`, tipRate.toString());
  }, [serviceEnabled, tipRate, tableId]);

  // --- Helpers ---
  const handleClearTable = async () => {
    try {
      await apiClient.post(`/table/${tableId}/reset`, {});
      toast.success("Table cleared!");
      setSplitResult(null);
      setItemAssignments({});
      setItemSplitGuests([]);
      setSelectedItem(null);
      fetchBill();
      fetchOrderedItems();
    } catch (err) {
      toast.error("Failed to clear table");
    }
  };

  const fetchBill = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.post(`/bill/${tableId}`, {
        service_enabled: serviceEnabled,
        tip_rate: tipRate
      });
      setBill(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bill');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderedItems = async () => {
    try {
      const data = await apiClient.get(`/table/${tableId}/items`);
      setMenuItems(data);
    } catch (err) {
      console.error('Failed to load ordered items:', err);
    }
  };

  useEffect(() => {
    fetchBill();
    fetchOrderedItems();
  }, [serviceEnabled, tipRate]); // refetch when service/tip changes

  // --- Equal Split ---
  const handleEqualSplit = async () => {
    try {
      setCalculating(true);
      const result = await apiClient.post(`/split/${tableId}/equal`, {
        num_guests: numGuests,
        service_enabled: serviceEnabled,
        tip_rate: tipRate
      });
      setSplitResult(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to calculate split');
    } finally {
      setCalculating(false);
    }
  };

  // --- Amount Split ---
  const handleAmountSplit = async () => {
    const payload = guests.reduce((acc, guest) => ({
      ...acc,
      [guest.name]: guest.amount
    }), {});

    try {
      setCalculating(true);
      const result = await apiClient.post(`/split/${tableId}/amount`, {
        ...payload,
        service_enabled: serviceEnabled,
        tip_rate: tipRate
      });
      setSplitResult(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to calculate split');
    } finally {
      setCalculating(false);
    }
  };

  // --- Item Split ---
  const handleItemSplit = async () => {
    const payload: Record<string, { items?: string[]; shared?: Record<string, number> }> = {};
    itemSplitGuests.forEach(guest => {
      payload[guest] = { items: [], shared: {} };
    });

    Object.entries(itemAssignments).forEach(([itemKey, assignedGuests]) => {
      if (assignedGuests.length === 1) {
        payload[assignedGuests[0]].items!.push(itemKey);
      } else if (assignedGuests.length > 1) {
        const sharePerGuest = 1 / assignedGuests.length;
        assignedGuests.forEach(guest => {
          payload[guest].shared![itemKey] = sharePerGuest;
        });
      }
    });

    try {
      setCalculating(true);
      const result = await apiClient.post(`/split/${tableId}/item`, {
        ...payload,
        service_enabled: serviceEnabled,
        tip_rate: tipRate
      });
      setSplitResult(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to calculate split');
    } finally {
      setCalculating(false);
    }
  };

  // --- Helpers for Guests ---
  const addGuest = () => setGuests(prev => [...prev, { name: `Guest ${prev.length + 1}`, amount: 0 }]);
  const removeGuest = (index: number) => guests.length > 1 && setGuests(prev => prev.filter((_, i) => i !== index));

  const getMaxAmountForGuest = (index: number): number => {
    if (!bill) return 0;
    const otherGuestsTotal = guests.reduce((sum, guest, i) => i === index ? sum : sum + guest.amount, 0);
    const remaining = Math.max(0, bill.total - otherGuestsTotal);
    return Math.round(remaining * 100) / 100;
  };

  const updateGuestAmount = (index: number, amount: number) => {
    if (Number.isNaN(amount)) {
      setGuests(prev =>
        prev.map((g, i) => i === index ? { ...g, amount: 0 } : g)
      );
      return;
    }

    if (amount < 0) {
      toast.error("Amount cannot be negative");
      return;
    }

    const maxAllowed = bill ? getMaxAmountForGuest(index) : amount;
    const clampedAmount = Math.round(Math.min(amount, maxAllowed) * 100) / 100;
    if (amount - maxAllowed > 0.0001) {
      toast.error(`Amount exceeds remaining balance. $${maxAllowed.toFixed(2)} left to assign.`);
    }

    setGuests(prev =>
      prev.map((g, i) => i === index ? { ...g, amount: clampedAmount } : g)
    );
  };

  const updateGuestName = (index: number, name: string) => setGuests(prev => prev.map((g, i) => i === index ? { ...g, name } : g));

  // --- Helpers for Item Split Guests ---
  const addItemSplitGuest = () => setItemSplitGuests(prev => [...prev, `Guest ${prev.length + 1}`]);
  const removeItemSplitGuest = (index: number) => {
    if (itemSplitGuests.length > 1) {
      const guestToRemove = itemSplitGuests[index];
      setItemSplitGuests(prev => prev.filter((_, i) => i !== index));
      setItemAssignments(prev => {
        const updated: Record<string, string[]> = {};
        Object.entries(prev).forEach(([key, val]) => {
          updated[key] = val.filter(g => g !== guestToRemove);
        });
        return updated;
      });
    }
  };
  const updateItemSplitGuestName = (index: number, name: string) => {
    const oldName = itemSplitGuests[index];
    setItemSplitGuests(prev => prev.map((g, i) => i === index ? name : g));
    if (oldName !== name) {
      setItemAssignments(prev => {
        const updated: Record<string, string[]> = {};
        Object.entries(prev).forEach(([key, val]) => {
          updated[key] = val.map(g => g === oldName ? name : g);
        });
        return updated;
      });
    }
  };
  const toggleItemAssignment = (itemKey: string, guest: string) => {
    setItemAssignments(prev => {
      const current = prev[itemKey] || [];
      const updated = current.includes(guest)
        ? current.filter(g => g !== guest)
        : [...current, guest];
      return { ...prev, [itemKey]: updated };
    });
  };
  const getItemAssignmentText = (itemKey: string) => {
    const assigned = itemAssignments[itemKey] || [];
    if (assigned.length === 0) return 'Unassigned';
    if (assigned.length === 1) return assigned[0];
    return `Split between ${assigned.length} guests`;
  };

  const formatCurrencyValue = (value: unknown): string => {
    const numeric = typeof value === "number" ? value : parseFloat(String(value));
    return Number.isFinite(numeric) ? numeric.toFixed(2) : "0.00";
  };

  const isGuestBreakdown = (entry: unknown): entry is GuestBreakdown => {
    return typeof entry === "object" && entry !== null && "total" in entry;
  };

  const isSummaryEntry = (label: string, entry: unknown): entry is Record<string, unknown> => {
    return typeof entry === "object" && entry !== null && label.toLowerCase() === "summary";
  };

  const renderResultContent = (label: string, entry: unknown): React.ReactNode => {
    if (isGuestBreakdown(entry)) {
      return (
        <div className="text-sm text-gray-700 space-y-1">
          <p>Subtotal: ${formatCurrencyValue(entry.subtotal)}</p>
          <p>Tax: ${formatCurrencyValue(entry.tax)}</p>
          <p>Service: ${formatCurrencyValue(entry.service)}</p>
          <p>Tip: ${formatCurrencyValue(entry.tip)}</p>
          <p className="font-bold text-green-600 mt-2">
            Total: ${formatCurrencyValue(entry.total)}
          </p>
        </div>
      );
    }

    if (isSummaryEntry(label, entry)) {
      return (
        <div className="text-sm text-gray-700 space-y-1">
          {Object.entries(entry).map(([summaryLabel, value]) => {
            const numeric = typeof value === "number" ? value : parseFloat(String(value));
            const display = Number.isFinite(numeric)
              ? `$${numeric.toFixed(2)}`
              : String(value);
            return (
              <p key={summaryLabel}>
                {summaryLabel}: {display}
              </p>
            );
          })}
        </div>
      );
    }

    if (typeof entry === "number") {
      return (
        <p className="text-green-600 font-bold">
          ${entry.toFixed(2)}
        </p>
      );
    }

    if (typeof entry === "string") {
      return <p className="text-sm text-gray-700">{entry}</p>;
    }

    return null;
  };

  // --- UI ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Spinner size="lg" className="mt-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate('/tables?mode=split', { replace: true })} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Split Bill</h1>
            <p className="text-gray-600 text-sm mt-1">Viewing bill for Table {tableId}</p>
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchBill} />}

        {bill && (
          <>
            {/* Service Charge + Tip Controls */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <label className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  checked={serviceEnabled}
                  onChange={(e) => setServiceEnabled(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Include Service Charge</span>
              </label>

              <p className="mb-2 font-medium text-gray-800">Extra Tip</p>
              <div className="flex space-x-3">
                {[0, 0.10, 0.25, 0.50].map(rate => (
                  <button
                    key={rate}
                    onClick={() => setTipRate(rate)}
                    className={`px-3 py-1 rounded-lg border ${
                      tipRate === rate ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {rate * 100}%
                  </button>
                ))}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Bill Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between"><span>Subtotal:</span><span>${bill.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax:</span><span>${bill.tax.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Service:</span><span>${bill.service.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tip:</span><span>${bill.tip.toFixed(2)}</span></div>
                <div className="border-t pt-2 mt-3 flex justify-between font-bold">
                  <span>Total:</span><span className="text-green-600">${bill.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Clear Table Button */}
              <button
                onClick={handleClearTable}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear Table
              </button>
            </div>

            {/* Split Options */}
            <SplitOptions selectedMethod={splitMethod} onMethodChange={m => { setSplitMethod(m); setSplitResult(null); }} />

            {/* --- Equal Split --- */}
            {splitMethod === 'equal' && (
              <div className="space-y-4 bg-white border rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold">Equal Split</h3>
                <div className="flex items-center space-x-4">
                  <label className="text-sm">Number of guests:</label>
                  <input
                    type="number"
                    min="1"
                    value={numGuests}
                    onChange={(e) => setNumGuests(parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-2 border rounded-lg"
                  />
                </div>
                <button onClick={handleEqualSplit} disabled={calculating} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                  {calculating ? <Spinner size="sm" /> : 'Calculate Split'}
                </button>
              </div>
            )}

            {/* --- Amount Split --- */}
            {splitMethod === 'amount' && (
              <div className="space-y-4 bg-white border rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold">Split by Amount</h3>
                <div className="space-y-3">
                  {guests.map((guest, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        placeholder="Guest name"
                        value={guest.name}
                        onChange={(e) => updateGuestName(index, e.target.value)}
                        className="flex-1 border px-3 py-2 rounded-lg"
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.10"
                          max={bill ? getMaxAmountForGuest(index) : undefined}
                          placeholder="0.00"
                          value={guest.amount === 0 ? "" : guest.amount}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateGuestAmount(index, value === "" ? 0 : parseFloat(value));
                          }}
                          className="w-24 pl-7 pr-3 py-2 border rounded-lg"
                        />
                      </div>
                      {guests.length > 1 && (
                        <button onClick={() => removeGuest(index)} className="p-2 text-red-500"><Minus /></button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <button onClick={addGuest} className="bg-gray-100 px-4 py-2 rounded-lg">+ Add Guest</button>
                  <button onClick={handleAmountSplit} disabled={calculating} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                    {calculating ? <Spinner size="sm" /> : 'Calculate Split'}
                  </button>
                </div>
              </div>
            )}

            {/* --- Item Split --- */}
            {splitMethod === 'items' && (
              <div className="mt-6 space-y-4 bg-white border rounded-lg p-6">
                {itemSplitStep === 'guests' && (
                  <>
                    <div className="flex items-center text-sm text-gray-600"><Users className="h-4 w-4 mr-1" /> Step 1: Add guests</div>
                    {itemSplitGuests.map((guest, i) => (
                      <div key={i} className="flex space-x-2 mb-2">
                        <span>{guest}</span>
                        {itemSplitGuests.length > 1 && (
                          <button onClick={() => removeItemSplitGuest(i)} className="text-red-500"><Minus /></button>
                        )}
                      </div>
                    ))}
                    <button onClick={addItemSplitGuest} className="bg-gray-100 px-3 py-1 rounded">+ Add Guest</button>
                    <button onClick={() => setItemSplitStep('items')} disabled={itemSplitGuests.some(g => !g.trim())} className="ml-2 bg-blue-600 text-white px-3 py-1 rounded">Next</button>
                  </>
                )}

                {itemSplitStep === 'items' && (
                  <>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span><Check className="h-4 w-4 mr-1 inline" /> Step 2: Assign items</span>
                      <button onClick={() => setItemSplitStep('guests')} className="text-blue-600">← Back</button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {menuItems.map(item => (
                        <div key={item.key} className="border rounded p-3">
                          <div className="flex justify-between"><h4>{item.name}</h4><span>${item.price.toFixed(2)}</span></div>
                          <p className="text-xs text-gray-600 mb-2">{item.category}</p>
                          <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                          <div className="text-xs mb-2">{getItemAssignmentText(item.key)}</div>
                          <button onClick={() => setSelectedItem(selectedItem === item.key ? null : item.key)} className="bg-blue-600 text-white px-2 py-1 rounded w-full">
                            {selectedItem === item.key ? 'Close' : 'Assign'}
                          </button>
                          {selectedItem === item.key && (
                            <div className="mt-2">
                              {itemSplitGuests.map(guest => (
                                <label key={guest} className="flex items-center">
                                  <input type="checkbox" checked={(itemAssignments[item.key] || []).includes(guest)} onChange={() => toggleItemAssignment(item.key, guest)} />
                                  <span className="ml-2">{guest}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end mt-4">
                      <button onClick={handleItemSplit} disabled={calculating} className="bg-blue-600 text-white px-4 py-2 rounded">
                        {calculating ? <Spinner size="sm" /> : 'Calculate Split'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Results */}
            {splitResult && (
              <div className="mt-6 border rounded p-4 bg-white">
                <h3 className="font-semibold mb-4">Split Results</h3>
                {Object.entries(splitResult as Record<string, unknown>).map(([guest, data]) => (
                  <div key={guest} className="mb-4 pb-3 border-b last:border-b-0">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{guest}</h4>
                    {renderResultContent(guest, data)}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
