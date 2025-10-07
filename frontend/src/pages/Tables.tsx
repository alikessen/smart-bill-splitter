import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../api/client";

const Tables = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode"); // "order" or "split"
  const tables = [1, 2, 3];

  const handleTableSelect = async (tableId: number) => {
    if (mode === "order") {
      const pendingOrder = localStorage.getItem("pendingOrder");

      if (pendingOrder) {
        try {
          const items = JSON.parse(pendingOrder);
          await apiClient.post(`/order/${tableId}`, { items });
          toast.success(`Order added to Table ${tableId}! Returning to main page...`);
          localStorage.removeItem("pendingOrder");
          // Give user a moment to see the toast before navigating
          setTimeout(() => navigate("/"), 1000);
        } catch (err) {
          toast.error("Failed to send order to table");
        }
      } else {
        navigate(`/menu?tableId=${tableId}`);
      }
    } else if (mode === "split") {
      navigate(`/split?tableId=${tableId}`);
    } else {
      toast.error("Invalid mode!");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Select a Table</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {tables.map((id) => (
          <div
            key={id}
            onClick={() => handleTableSelect(id)}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:shadow-lg transition"
          >
            <div className="w-24 h-24 flex items-center justify-center rounded-full bg-blue-500 text-white text-3xl font-bold shadow-md">
              {id}
            </div>
            <p className="text-gray-700 font-medium">Table {id}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-gray-500">
        {mode === "order"
          ? "Select a table to send your order"
          : "Select a table to view or split the bill"}
      </p>

      <button
        onClick={() => navigate("/")}
        className="mt-6 text-blue-600 font-medium hover:underline transition-colors"
      >
        Back to Main Menu
      </button>
    </div>
  );
};

export default Tables;
