"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const TargetsGapForm = ({ UpdateTargetsGap, oldPhase1, oldPhase2, oldPhase3 }) => {
  const [phase1, setPhase1] = useState("");
  const [phase2, setPhase2] = useState("");
  const [phase3, setPhase3] = useState("");

  const Update = async () => {
    const response = await UpdateTargetsGap({ phase1, phase2, phase3 });
    if (response.error) toast.error(response.message);
  };

  useEffect(() => {
    if (oldPhase1) setPhase1(oldPhase1);
    if (oldPhase2) setPhase2(oldPhase2);
    if (oldPhase3) setPhase3(oldPhase3);
  }, [oldPhase1, oldPhase2, oldPhase3]);

  return (
    <div className="flex flex-col gap-2 border border-gray-300 p-4 rounded-lg w-full max-w-[350px]">
      <div className="text-center text-gray-500 text-xs flex items-center justify-between">
        <div>Phase 1: {oldPhase1}%</div>
        <div>Phase 2: {oldPhase2}%</div>
        <div>Phase 3: {oldPhase3}%</div>
      </div>
      <div className="flex gap-2">
        <input value={phase1} onChange={(e) => setPhase1(e.target.value)} className="input rounded" type="number" placeholder="Phase 1" />
        <input value={phase2} onChange={(e) => setPhase2(e.target.value)} className="input rounded" type="number" placeholder="Phase 2" />
        <input value={phase3} onChange={(e) => setPhase3(e.target.value)} className="input rounded" type="number" placeholder="Phase 3" />
      </div>
      <button onClick={Update} className="w-full px-4 py-2 bg-blue-500 text-white text-lg rounded">
        ✔
      </button>
    </div>
  );
};

export default TargetsGapForm;
