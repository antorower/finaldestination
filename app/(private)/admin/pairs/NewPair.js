"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

const NewPair = ({ SaveNewPair, nameVar, lotsVar, priorityVar, costFactorVar }) => {
  const [name, setName] = useState("");
  const [lots, setLots] = useState("");
  const [priority, setPriority] = useState("");
  const [costFactor, setCostFactor] = useState("");

  useEffect(() => {
    if (nameVar) setName(nameVar);
    if (lotsVar) setLots(lotsVar);
    if (priorityVar) setPriority(priorityVar);
    if (costFactorVar) setCostFactor(costFactorVar);
  }, [nameVar, lotsVar, priorityVar, costFactorVar]);

  const SavePair = async () => {
    const response = await SaveNewPair({ name, lots, priority, costFactor });
    if (response.error) toast.error(response.message);
  };

  return (
    <div className="flex flex-col gap-2">
      <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Pair" className="input" />
      <input value={lots} onChange={(e) => setLots(e.target.value)} type="number" placeholder="Lots" className="input" />
      <input value={priority} onChange={(e) => setPriority(e.target.value)} type="number" placeholder="Priority" className="input" />
      <input value={costFactor} onChange={(e) => setCostFactor(e.target.value)} type="number" placeholder="Cost Factor" className="input" />
      <button onClick={SavePair} className="bg-blue-500 text-white p-4 text-xl font-bold">
        ✔
      </button>
    </div>
  );
};

export default NewPair;
