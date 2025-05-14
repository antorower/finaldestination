"use client";
import { useState } from "react";

export default function PropFirmSimulator() {
  const [days, setDays] = useState(360);
  const [reports, setReports] = useState([]);

  const [accounts, setAccounts] = useState({
    ftmo: { phase1: 9, phase2: 4, phase3: 1 },
    the5ers: { phase1: 5, phase2: 4, phase3: 3 },
    fundingPips: { phase1: 8, phase2: 6, phase3: 0 },
    fundedNext: { phase1: 10, phase2: 4, phase3: 0 },
  });

  const [riskPerPhase, setRiskPerPhase] = useState({
    phase1: 2.5,
    phase2: 2.5,
    phase3: 2,
  });

  const handleAccountChange = (firm, phase, value) => {
    setAccounts((prev) => ({
      ...prev,
      [firm]: {
        ...prev[firm],
        [phase]: Number(value),
      },
    }));
  };

  const handleRiskChange = (phase, value) => {
    setRiskPerPhase((prev) => ({
      ...prev,
      [phase]: Number(value),
    }));
  };

  const handleSimulationStart = () => {
    const targets = {
      ftmo: { phase1: 10, phase2: 5, phase3: 2 },
      default: { phase1: 8, phase2: 5, phase3: 2 },
    };

    let fundPool = 0;
    const allAccounts = [];
    const reportList = [];

    Object.keys(accounts).forEach((firm) => {
      ["phase1", "phase2", "phase3"].forEach((phaseKey) => {
        const count = accounts[firm][phaseKey];
        const phase = Number(phaseKey.replace("phase", ""));
        for (let i = 0; i < count; i++) {
          allAccounts.push({
            firm,
            phase,
            progress: 0,
            status: "active",
            cooldown: 0,
            pendingAction: null,
          });
        }
      });
    });

    const getTarget = (firm, phase) => {
      return (targets[firm] || targets.default)[`phase${phase}`];
    };

    const getRisk = (phase) => {
      return riskPerPhase[`phase${phase}`];
    };

    const getFirmCounts = () => {
      const counts = { ftmo: 0, the5ers: 0, fundingPips: 0, fundedNext: 0 };
      allAccounts.forEach((acc) => {
        if (acc.status === "active" || acc.status === "cooldown") counts[acc.firm]++;
      });
      return counts;
    };

    for (let day = 1; day <= days; day++) {
      const activeAccounts = allAccounts.filter((acc) => acc.status === "active");
      const tradeCount = Math.floor(activeAccounts.length * 0.35);
      const selectedForTrade = activeAccounts.sort(() => 0.5 - Math.random()).slice(0, tradeCount);

      for (const acc of selectedForTrade) {
        const target = getTarget(acc.firm, acc.phase);
        const risk = getRisk(acc.phase);
        const remainingToTarget = target - acc.progress;
        const maxDrawdownPerPhase = { 1: 10, 2: 10, 3: 10 };
        const drawdownLimit = maxDrawdownPerPhase[acc.phase];
        const remainingUntilFailure = acc.progress + drawdownLimit;
        const actualRisk = Math.min(risk, remainingToTarget, Math.abs(remainingUntilFailure));
        const isWin = Math.random() < 0.5;
        acc.progress += isWin ? actualRisk : -actualRisk;

        if (acc.progress >= target) {
          if (acc.phase === 3) {
            acc.status = "cooldown";
            acc.cooldown = 10;
            acc.pendingAction = "payout";
          } else {
            acc.status = "cooldown";
            acc.cooldown = 4;
            acc.pendingAction = "promote";
          }
        } else if (acc.progress <= -maxDrawdownPerPhase[acc.phase]) {
          acc.status = "failed";
        }
      }

      for (const acc of allAccounts) {
        if (acc.status === "cooldown") {
          acc.cooldown--;
          if (acc.cooldown <= 0) {
            if (acc.pendingAction === "promote") {
              acc.phase += 1;
              acc.progress = 0;
              acc.status = "active";
            } else if (acc.pendingAction === "payout") {
              const payoutAmount = 100000 * (getTarget(acc.firm, acc.phase) / 100) * 0.6;
              fundPool += payoutAmount;
              acc.progress = 0;
              acc.status = "active";
            }
            acc.pendingAction = null;
          }
        }
      }

      while (fundPool >= 550 && allAccounts.filter((acc) => acc.status !== "failed").length < 150) {
        const firmCounts = getFirmCounts();
        const firmWithLeast = Object.entries(firmCounts).sort((a, b) => a[1] - b[1])[0][0];
        allAccounts.push({
          firm: firmWithLeast,
          phase: 1,
          progress: 0,
          status: "active",
          cooldown: 0,
          pendingAction: null,
        });
        fundPool -= 550;
      }

      if (day % 30 === 0 || day === days) {
        const summary = { phase1: 0, phase2: 0, phase3: 0 };
        for (const acc of allAccounts) {
          if (acc.status !== "failed") {
            summary[`phase${acc.phase}`]++;
          }
        }
        const total = summary.phase1 + summary.phase2 + summary.phase3;
        reportList.push({
          day,
          ...summary,
          total,
          fundPool: fundPool.toFixed(2),
        });
      }
    }

    setReports(reportList);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">🎯Monte Carlo Simulator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(accounts).map((firm) => (
          <div key={firm} className="p-4 border rounded-xl shadow space-y-2">
            <h2 className="text-xl font-semibold capitalize">{firm}</h2>
            {["phase1", "phase2", "phase3"].map((phase) => (
              <div key={phase} className="flex justify-between items-center">
                <label className="capitalize">{phase.replace("phase", "Phase ")}</label>
                <input type="number" value={accounts[firm][phase]} onChange={(e) => handleAccountChange(firm, phase, e.target.value)} className="w-20 p-1 border rounded text-right" />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="p-4 border rounded-xl shadow space-y-3">
        <h2 className="text-xl font-semibold">⚠️ Ρίσκο Ανά Φάση (%):</h2>
        {["phase1", "phase2", "phase3"].map((phase) => (
          <div key={phase} className="flex justify-between items-center">
            <label className="capitalize">{phase.replace("phase", "Phase ")}</label>
            <input type="number" value={riskPerPhase[phase]} onChange={(e) => handleRiskChange(phase, e.target.value)} className="w-24 p-1 border rounded text-right" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <label className="text-lg font-medium">📆 Μέρες Simulation:</label>
        <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-24 p-2 border rounded text-right" />
      </div>

      <button onClick={handleSimulationStart} className="bg-black text-white px-6 py-2 rounded-xl shadow hover:bg-gray-800">
        Ξεκίνα Προσομοίωση
      </button>

      {reports.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-2xl font-semibold">📊 Αναφορές</h2>
          {reports.map((r, i) => (
            <div key={i} className="p-3 border rounded bg-gray-100">
              <p className="font-bold">Ημέρα {r.day}</p>
              <p>Phase 1: {r.phase1}</p>
              <p>Phase 2: {r.phase2}</p>
              <p>Phase 3: {r.phase3}</p>
              <p>Σύνολο: {r.total} accounts</p>
              <p>💰 Ταμείο: ${r.fundPool}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
