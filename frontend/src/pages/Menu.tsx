import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { MenuItem } from '../types';
import apiClient from '../api/client';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Menu() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("tableId");

  // --- Fetch Menu ---
  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get('/menu');
      setMenuItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // --- Quantity Controls ---
  const increment = (id: number) => {
    setQuantities(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decrement = (id: number) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max((prev[id] || 0) - 1, 0) }));
  };

  // --- Submit Order directly to backend ---
  const handleSubmitOrder = async () => {
    if (!tableId) {
      toast.error("No table selected!");
      navigate("/tables?mode=order");
      return;
    }

    const items: number[] = [];
    Object.entries(quantities).forEach(([id, qty]) => {
      for (let i = 0; i < qty; i++) {
        items.push(parseInt(id));
      }
    });

    if (items.length === 0) {
      toast.error('Please select at least one item');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post(`/order/${tableId}`, { items });
      toast.success(`Order submitted successfully for Table ${tableId}!`);
      setQuantities({});
      // Return to home after submission
      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit order');
    } finally {
      setSubmitting(false);
    }
  };

  const totalSelected = Object.values(quantities).reduce((a, b) => a + b, 0);

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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/tables?mode=order')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Menu</h1>
              {tableId && (
                <p className="text-gray-600 text-sm mt-1">
                  Ordering for Table {tableId}
                </p>
              )}
            </div>
          </div>
          
          {totalSelected > 0 && (
            <button
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              {submitting ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  <span>Submit Order ({totalSelected})</span>
                </>
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={fetchMenu} />
          </div>
        )}

        {menuItems.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {menuItems.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-blue-600 font-medium mb-2">{item.category}</p>
                <p className="text-xs text-gray-600 mb-3">{item.description}</p>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => decrement(item.id)}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span className="font-medium">{quantities[item.id] || 0}</span>
                  <button
                    onClick={() => increment(item.id)}
                    className="px-3 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {menuItems.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500">No menu items available</p>
          </div>
        )}
      </div>
    </div>
  );
}
