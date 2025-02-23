"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const UserPaymentMethod = ({ userId, SetPaymentMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [amount, setAmount] = useState("");

  const SavePaymentMode = async (mode) => {
    if (!amount) {
      toast.warn("Συμπλήρωσε το ποσό");
      return;
    }
    const amountNumber = Number(amount);
    const response = SetPaymentMode({ userId, mode, amount: amountNumber });
    if (!response) {
      toast.error("Κάτι πήγε στραβά. Κάνε refresh και δοκίμασε ξανά.");
    } else {
      setIsExpanded(false);
    }
  };

  return (
    <div className="m-auto flex flex-col gap-4">
      {isExpanded && (
        <>
          <div className="flex gap-4">
            <button onClick={() => SavePaymentMode("Percentage")} className="bg-blue-700 px-3 py-2 rounded w-full">
              Ποσοστό
            </button>
            <button onClick={() => SavePaymentMode("Salary")} className="bg-blue-700 px-3 py-2 rounded w-full">
              Μισθός
            </button>
          </div>
          <input onChange={(e) => setAmount(e.target.value)} type="text" placeholder="Ποσό ή Ποσοστό" className="input" />
          <button onClick={() => setIsExpanded(false)} className="bg-purple-700 p-4 rounded">
            ❌
          </button>
        </>
      )}
      {!isExpanded && (
        <button onClick={() => setIsExpanded(true)} className="bg-purple-700 p-4 rounded">
          💶 Μέθοδος Πληρωμής
        </button>
      )}
    </div>
  );
};

export default UserPaymentMethod;
