"use client";

import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { RefreshCw } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

export default function BalanceUpdateForm({ accountId, currentBalance, UpdateAccountBalance }) {
  const [newBalance, setNewBalance] = useState(currentBalance);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await UpdateAccountBalance({
        accountId,
        newBalance,
      });

      if (result.error) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
    } catch (error) {
      toast.error("Υπήρξε πρόβλημα κατά την ενημέρωση του balance");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input type="number" value={newBalance} onChange={(e) => setNewBalance(Number(e.target.value))} className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" />
        <button type="submit" disabled={isLoading} className={`flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}>
          {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
          {isLoading ? "Ενημέρωση..." : "Ενημέρωση Balance"}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
    </>
  );
}
