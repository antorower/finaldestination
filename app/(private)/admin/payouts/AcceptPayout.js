"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const AcceptPayout = ({ ChangePayoutAmount, AcceptPayoutFunc, payoutId }) => {
  const [newPayoutAmount, setNewPayoutAmount] = useState("");

  const Change = async () => {
    const response = await ChangePayoutAmount({ newAmount: newPayoutAmount, payoutId });
    if (response.error) toast.error(response.message);
  };

  const Accept = async () => {
    const response = await AcceptPayoutFunc({ payoutId });
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success(response.message);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 justify-between">
        <input value={newPayoutAmount} onChange={(e) => setNewPayoutAmount(e.target.value)} type="number" className="input rounded" />
        <button onClick={Change} className="bg-blue-500 w-full h-full p-2 rounded text-white font-bold hover:bg-blue-600 transition-colors duration-300">
          Change
        </button>
      </div>
      <button onClick={Accept} className="bg-green-500 hover:bg-green-600 transition-colors duration-300 rounded text-white font-bold p-3 text-center text-lg">
        Accept
      </button>
    </div>
  );
};

export default AcceptPayout;
