"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const AddPairForm = ({ SaveNewPair }) => {
  const [name, setName] = useState("");
  const [lots, setLots] = useState("");
  const [priority, setPriority] = useState("");
  const [expensesFactor, setExpensesFactor] = useState("");
  const router = useRouter();

  const SavePair = async () => {
    const response = await SaveNewPair({ name, lots, priority, expensesFactor });
    if (response) {
      toast.success("Pair added successfully");
      router.refresh();
    } else {
      toast.warn("Something went wrong");
    }
  };

  return (
    <div className="w-[200px] flex flex-col gap-2">
      <input type="text" required minLength={3} maxLength={20} value={name} onChange={(e) => setName(e.target.value)} placeholder="Pair" className="input" />
      <input type="text" required minLength={3} maxLength={20} value={lots} onChange={(e) => setLots(e.target.value)} placeholder="Lots/1.000$" className="input" />
      <input type="text" required minLength={1} maxLength={4} value={priority} onChange={(e) => setPriority(e.target.value)} placeholder="Priority" className="input" />
      <input type="text" required minLength={1} maxLength={4} value={expensesFactor} onChange={(e) => setExpensesFactor(e.target.value)} placeholder="Expenses Factor" className="input" />
      <button onClick={SavePair} className="bg-orange-700 p-3 rounded-b hover:bg-orange-600 text-white font-semibold outline-none">
        Add Pair
      </button>
    </div>
  );
};

export default AddPairForm;
