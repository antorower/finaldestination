"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const AddPairForm = ({ SaveNewPair }) => {
  const [name, setName] = useState("");
  const [minLots, setMinLots] = useState("");
  const [maxLots, setMaxLots] = useState("");
  const router = useRouter();

  const SavePair = async () => {
    const response = await SaveNewPair({ name, minLots, maxLots });
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
      <input type="text" required minLength={3} maxLength={20} value={minLots} onChange={(e) => setMinLots(e.target.value)} placeholder="Minimum Lots" className="input" />
      <input type="text" required minLength={3} maxLength={20} value={maxLots} onChange={(e) => setMaxLots(e.target.value)} placeholder="Maximum Lots" className="input" />
      <button onClick={SavePair} className="bg-orange-700 p-3 rounded-b hover:bg-orange-600 text-white font-semibold outline-none">
        Add Pair
      </button>
    </div>
  );
};

export default AddPairForm;
