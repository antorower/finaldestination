"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const CreateCompany = ({ CreateNewCompany }) => {
  const [name, setName] = useState("");
  const [maxAccounts, setMaxAccounts] = useState("");
  const [costFactor, setCostFactor] = useState("");
  const [maxLots, setMaxLots] = useState("");

  const Create = async () => {
    if (!name || !maxAccounts || !costFactor) {
      toast.warn("Συμπλήρωσε όλα τα στοιχεία");
      return;
    }
    const response = await CreateNewCompany({ name, maxAccounts, costFactor, maxLots });
    if (response.error) toast.error(response.message);
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-[300px] m-auto">
      <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Name" className="input" />
      <input value={maxAccounts} onChange={(e) => setMaxAccounts(e.target.value)} type="number" placeholder="Max Accounts" className="input" />
      <input value={costFactor} onChange={(e) => setCostFactor(e.target.value)} type="number" placeholder="Cost Factor" className="input" />
      <input value={maxLots} onChange={(e) => setMaxLots(e.target.value)} type="number" placeholder="Max Lots" className="input" />
      <button onClick={Create} className="bg-blue-500 text-white p-4 text-xl font-bold">
        ✔
      </button>
    </div>
  );
};

export default CreateCompany;
