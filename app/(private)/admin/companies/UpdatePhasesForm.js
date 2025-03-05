"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const UpdatePhasesForm = ({ UpdatePhase, companyId, oldDailyDrawdown, oldTotalDrawdown, oldTarget, oldMaxRiskPerTrade, oldInstructions }) => {
  const [dailyDrawdown, setDailyDrawdown] = useState("");
  const [totalDrawdown, setTotalDrawdown] = useState("");
  const [target, setTarget] = useState("");
  const [maxRiskPerTrade, setMaxRiskPerTrade] = useState("");
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    if (oldDailyDrawdown) setDailyDrawdown(oldDailyDrawdown);
    if (oldTotalDrawdown) setTotalDrawdown(oldTotalDrawdown);
    if (oldTarget) setTarget(oldTarget);
    if (oldMaxRiskPerTrade) setMaxRiskPerTrade(oldMaxRiskPerTrade);
    if (oldInstructions) setInstructions(oldInstructions);
  }, [oldDailyDrawdown, oldTotalDrawdown, oldTarget, oldMaxRiskPerTrade, oldInstructions]);

  const Update = async () => {
    if (!dailyDrawdown || !totalDrawdown || !target || !maxRiskPerTrade) {
      toast.warn("Συμπλήρωσε όλα τα πεδία");
    }
    const response = await UpdatePhase({ companyId, dailyDrawdown, totalDrawdown, target, maxRiskPerTrade, instructions });
    if (response.error) toast.error(response.message);
  };

  return (
    <div className="flex flex-col gap-2">
      <input value={dailyDrawdown} onChange={(e) => setDailyDrawdown(e.target.value)} type="number" placeholder="Daily Drawdown" className="input" />
      <input value={totalDrawdown} onChange={(e) => setTotalDrawdown(e.target.value)} type="number" placeholder="Total Drawdown" className="input" />
      <input value={target} onChange={(e) => setTarget(e.target.value)} type="number" placeholder="Target" className="input" />
      <input value={maxRiskPerTrade} onChange={(e) => setMaxRiskPerTrade(e.target.value)} type="number" placeholder="Max Risk Per Trade" className="input" />
      <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} type="text" placeholder="Instructions" className="input" />
      <button onClick={Update} className="w-full bg-blue-500 p-2 text-white">
        ✔
      </button>
    </div>
  );
};

export default UpdatePhasesForm;
