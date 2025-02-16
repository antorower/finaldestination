"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const AddCompany = ({ SaveCompany }) => {
  const [name, setName] = useState("");
  const [maxAccounts, setMaxAccounts] = useState("");
  const [phases, setPhases] = useState([]);
  const [commissionFactor, setCommissionFactor] = useState("");
  const [link, setLink] = useState("");
  const [active, setActive] = useState(false);
  const [maxLots, setMaxLots] = useState("");

  const router = useRouter();

  const addPhase = () => {
    setPhases([
      ...phases,
      {
        name: "",
        dailyDrawdown: "",
        totalDrawdown: "",
        target: "",
        maxRiskPerTrade: "",
        instructions: "",
      },
    ]);
  };

  const updatePhase = (index, field, value) => {
    const updatedPhases = phases.map((phase, i) => (i === index ? { ...phase, [field]: value } : phase));
    setPhases(updatedPhases);
  };

  const SubmitCompany = async () => {
    const companyData = {
      name,
      maxAccounts: parseInt(maxAccounts),
      phases: phases.map((phase) => ({
        ...phase,
        dailyDrawdown: parseFloat(phase.dailyDrawdown),
        totalDrawdown: parseFloat(phase.totalDrawdown),
        target: parseFloat(phase.target),
        maxRiskPerTrade: parseFloat(phase.maxRiskPerTrade),
      })),
      commissionFactor: parseFloat(commissionFactor),
      link,
      maxLots: parseFloat(maxLots),
    };
    const response = await SaveCompany(companyData);
    if (response) {
      toast.success("Company created");
      router.refresh();
    } else {
      toast.error("There was an error creating the company");
    }
  };

  return (
    <div className="border border-gray-700 p-4">
      {active && (
        <div className="flex flex-col gap-4">
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Company Name" className="input" />
          <input type="number" required value={maxAccounts} onChange={(e) => setMaxAccounts(e.target.value)} placeholder="Max Accounts" className="input" />
          <input type="number" required value={commissionFactor} onChange={(e) => setCommissionFactor(e.target.value)} placeholder="Commission Factor" className="input" />
          <input type="number" required value={maxLots} onChange={(e) => setMaxLots(e.target.value)} placeholder="Max Lots" className="input" />
          <input type="text" required value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link" className="input" />

          <div>
            {phases.map((phase, index) => (
              <div key={index} className="flex flex-col gap-2 border border-gray-900 p-2 mb-4">
                <input type="text" required value={phase.name} onChange={(e) => updatePhase(index, "name", e.target.value)} placeholder="Phase Name" className="input" />
                <input type="number" required value={phase.dailyDrawdown} onChange={(e) => updatePhase(index, "dailyDrawdown", e.target.value)} placeholder="Daily Drawdown" className="input" />
                <input type="number" required value={phase.totalDrawdown} onChange={(e) => updatePhase(index, "totalDrawdown", e.target.value)} placeholder="Total Drawdown" className="input" />
                <input type="number" required value={phase.target} onChange={(e) => updatePhase(index, "target", e.target.value)} placeholder="Target" className="input" />
                <input type="number" required value={phase.maxRiskPerTrade} onChange={(e) => updatePhase(index, "maxRiskPerTrade", e.target.value)} placeholder="Max Risk Per Trade" className="input" />
                <input type="text" required value={phase.instructions} onChange={(e) => updatePhase(index, "instructions", e.target.value)} placeholder="Instructions" className="input" />
              </div>
            ))}
            <button type="button" onClick={addPhase} className="bg-blue-500 text-white px-4 py-2 rounded w-full">
              Add Phase
            </button>
          </div>

          <button onClick={SubmitCompany} className="bg-green-500 text-white px-4 py-2 rounded">
            Add Company
          </button>
        </div>
      )}
      {!active && (
        <button className="bg-blue-500 p-4 rounded font-black w-full" onClick={() => setActive(true)}>
          New Company
        </button>
      )}
    </div>
  );
};

export default AddCompany;
