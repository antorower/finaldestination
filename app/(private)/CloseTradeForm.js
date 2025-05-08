"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "react-toastify";

const CloseTradeForm = ({ UpdateBalance, tradeId, userId, account, prevBalance, tp, sl }) => {
  const [newBalance, setNewBalance] = useState("");
  const [correctBalance, setCorrectBalance] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (newBalance !== "") {
      const numBalance = Number.parseFloat(newBalance);
      setCorrectBalance((numBalance >= prevBalance - sl * 1.3 && numBalance <= prevBalance + sl * 0.9) || (numBalance <= prevBalance + tp * 1.3 && numBalance >= prevBalance + tp * 0.8));
    }
  }, [newBalance, prevBalance, sl, tp]);

  const Update = () => {
    startTransition(async () => {
      try {
        await UpdateBalance({ tradeId, userId, newBalance: Number.parseFloat(newBalance) });
        toast.success("Balance updated successfully");
        setNewBalance("");
      } catch (error) {
        toast.error(error.message || "An error occurred while updating the balance");
      }
    });
  };

  return (
    <div className="bg-indigo-100 p-4 flex flex-col rounded justify-center items-center flex-wrap gap-2 w-full m-auto max-w-[280px]">
      <div>
        Νέο Balance για <span className="font-bold text-lg">{account}</span>
      </div>
      <input value={newBalance} onChange={(e) => setNewBalance(e.target.value)} type="number" max={111000} min={88000} placeholder="Νέο Balance" className="input rounded w-full p-2" />
      {!correctBalance && newBalance !== "" && <div className="text-sm text-center text-red-500 font-bold">Προσοχή στο balance</div>}
      <button onClick={Update} disabled={newBalance === "" || isPending} className={`text-white ${correctBalance ? "bg-blue-500" : "bg-red-500"} w-full p-2 rounded ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}>
        {correctBalance ? (isPending ? "Ενημέρωση..." : "✔") : "Είναι σωστό;"}
      </button>
    </div>
  );
};

export default CloseTradeForm;
