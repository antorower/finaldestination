"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { RefreshCw } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="flex flex-col w-full items-center gap-2 mt-2">
      <input type="number" value={newBalance} onChange={(e) => setNewBalance(Number(e.target.value))} className="px-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" />
      <button type="submit" disabled={isLoading} className={`flex items-center gap-1 px-3 py-2 text-sm font-medium text-white w-full bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}>
        {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
        {isLoading ? "Ενημέρωση..." : "Ενημέρωση"}
      </button>
    </form>
  );
}
