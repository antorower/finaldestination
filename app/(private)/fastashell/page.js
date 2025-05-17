"use client";

import { useState } from "react";

const companies = {
  FundedNext: {
    name: "FundedNext",
    accounts: {
      6000: {
        price: 59,
        bonus: 117,
      },
      15000: {
        price: 119,
        bonus: 292,
      },
      25000: {
        price: 199,
        bonus: 487,
      },
      50000: {
        price: 299,
        bonus: 975,
      },
      100000: {
        price: 549,
        bonus: 1950,
      },
      200000: {
        price: 999,
        bonus: 3900,
      },
    },
    phase1Target: 8,
    firstPaymentDays: 21,
    refund: 1,
  },
  FundingPips: {
    name: "FundingPips",
    accounts: {
      5000: {
        price: 36,
      },
      10000: {
        price: 66,
      },
      25000: {
        price: 156,
      },
      50000: {
        price: 266,
      },
      100000: {
        price: 470,
      },
    },
    phase1Target: 8,
    firstPaymentDays: 14,
    refund: 4,
  },
  The5ers: {
    name: "The5ers",
    accounts: {
      5000: {
        price: 39,
      },
      10000: {
        price: 78,
      },
      20000: {
        price: 165,
      },
      60000: {
        price: 329,
      },
      100000: {
        price: 545,
      },
    },
    phase1Target: 8,
    firstPaymentDays: 14,
    refund: 1,
  },
  FTMO: {
    name: "FTMO",
    accounts: {
      10000: {
        price: 99,
      },
      25000: {
        price: 278,
      },
      50000: {
        price: 384,
      },
      100000: {
        price: 600,
      },
      200000: {
        price: 1200,
      },
    },
    phase1Target: 10,
    firstPaymentDays: 14,
    refund: 1,
  },
};

const isWeekend = (day) => {
  const dayOfWeek = day % 7;
  return dayOfWeek === 5 || dayOfWeek === 6;
};

const FastAsHell = () => {
  const [selectedCounts, setSelectedCounts] = useState({});
  const [budget, setBudget] = useState(0);
  const [monthlyReports, setMonthlyReports] = useState([]);

  const [payoutTargetPercent, setPayoutTargetPercent] = useState(4);
  const [monthsToSimulate, setMonthsToSimulate] = useState(6);
  const [tradesPerDay, setTradesPerDay] = useState(3);
  const [phase1Risk, setPhase1Risk] = useState(2);
  const [phase2Risk, setPhase2Risk] = useState(2);
  const [phase3Risk, setPhase3Risk] = useState(2);

  const [results, setResults] = useState({
    treasury: 0,
    minTreasury: 0,
    totalAccounts: 0,
  });

  const handleSelect = (companyKey, accountSize, accountData) => {
    const key = `${companyKey}-${accountSize}`;
    const currentCount = selectedCounts[key] || 0;

    setSelectedCounts({
      ...selectedCounts,
      [key]: currentCount + 1,
    });

    setBudget(budget + accountData.price);
  };

  const handleRemove = (companyKey, accountSize, accountData) => {
    const key = `${companyKey}-${accountSize}`;
    const currentCount = selectedCounts[key] || 0;

    if (currentCount === 0) return;

    const newCounts = { ...selectedCounts };
    if (currentCount === 1) {
      delete newCounts[key];
    } else {
      newCounts[key] = currentCount - 1;
    }

    setSelectedCounts(newCounts);
    setBudget(budget - accountData.price);
  };

  const totalAccounts = Object.values(selectedCounts).reduce((sum, count) => sum + count, 0);

  const totalCapital = Object.entries(selectedCounts).reduce((sum, [key, count]) => {
    const [companyKey, accountSize] = key.split("-");
    return sum + count * parseInt(accountSize);
  }, 0);

  const CreateAccounts = () => {
    const accounts = [];

    const generateId = () =>
      Math.floor(Math.random() * 1e15)
        .toString()
        .padStart(15, "0");

    Object.entries(selectedCounts).forEach(([key, count]) => {
      const [companyKey, accountSizeStr] = key.split("-");
      const accountSize = parseInt(accountSizeStr);
      const company = companies[companyKey];
      const accountData = company.accounts[accountSize];

      for (let i = 0; i < count; i++) {
        accounts.push({
          id: generateId(),
          company: companyKey,
          capital: accountSize,
          balance: accountSize,
          phase: 1,
          phase1Target: (company.phase1Target * accountSize) / 100 + accountSize,
          phase2Target: (5 * accountSize) / 100 + accountSize,
          phase3Target: (payoutTargetPercent * accountSize) / 100 + accountSize,
          phase1MaxRiskPerTrade: (accountSize * phase1Risk) / 100,
          phase2MaxRiskPerTrade: (accountSize * phase2Risk) / 100,
          phase3MaxRiskPerTrade: (accountSize * phase3Risk) / 100,
          firstPaymentDays: company.firstPaymentDays,
          totalProfits: 0,
          numberOfPayouts: 0,
          bonusAmount: accountData.bonus || 0,
          bonusTaken: false,
          refundAmount: accountData.price,
          refundTaken: false,
          refundPayoutNumber: company.refund,
          status: "active",
          payoutDay: 0,
          upgradeDay: 0,
          startingDay: 0,
        });
      }
    });

    return accounts;
  };

  const SimulationExecution = () => {
    const newMonthlyReports = [];
    const accounts = CreateAccounts();
    const MAX_DAILY_RISK_PERCENT = 4;
    const totalDays = monthsToSimulate * 30;
    let treasury = 0;
    let minTreasury = 0;
    let totalAccounts = accounts.length;
    console.log("Total accounts created:", totalAccounts);

    for (let day = 0; day < totalDays; day++) {
      accounts.forEach((account) => {
        if (account.status === "active" && !isWeekend(day)) {
          let tradesPlaced = 0;
          let dailyRiskUsed = 0;

          const currentTarget = account.phase === 1 ? account.phase1Target : account.phase === 2 ? account.phase2Target : account.phase3Target;

          const maxRiskPerTrade = account.phase === 1 ? account.phase1MaxRiskPerTrade : account.phase === 2 ? account.phase2MaxRiskPerTrade : account.phase3MaxRiskPerTrade;

          const maxDailyRisk = (account.capital * MAX_DAILY_RISK_PERCENT) / 100;
          const stopLossLevel = account.capital * 0.9;

          while (tradesPlaced < tradesPerDay && dailyRiskUsed + maxRiskPerTrade <= maxDailyRisk) {
            const remainingLoss = account.balance - stopLossLevel;
            const remainingTarget = currentTarget - account.balance;

            const riskAmount = Math.min(maxRiskPerTrade, remainingLoss);
            const profitAmount = Math.min(maxRiskPerTrade, remainingTarget);

            if (riskAmount <= 0 || profitAmount <= 0) break;

            const probabilityOfWin = riskAmount / (riskAmount + profitAmount);
            const didWin = Math.random() < probabilityOfWin;

            if (didWin) {
              account.balance += profitAmount;
              account.totalProfits += profitAmount;
            } else {
              account.balance -= riskAmount;
            }

            dailyRiskUsed += riskAmount;
            tradesPlaced++;

            // Αν φτάσει στο stop loss (χάνει)
            if (account.balance <= stopLossLevel) {
              account.phase = 1;
              account.balance = account.capital;
              account.status = "active";
              account.startingDay = day;
              account.upgradeDay = 0;
              account.payoutDay = 0;
              account.totalProfits = 0;
              account.numberOfPayouts = 0;
              treasury -= account.refundAmount;
              if (treasury < minTreasury) {
                minTreasury = treasury;
              }
              totalAccounts++;
              break;
            }

            // Αν φτάσει στον στόχο (κερδίζει)
            if (account.balance >= currentTarget) {
              if (account.phase === 1) {
                account.phase = 2;
                account.balance = account.capital;
                account.status = "upgrade";
                account.upgradeDay = account.startingDay + 5;
              } else if (account.phase === 2) {
                account.phase = 3;
                account.balance = account.capital;
                account.status = "upgrade";
                account.upgradeDay = account.startingDay + 5;
              } else if (account.phase === 3) {
                account.status = "payout";
                account.payoutDay = account.startingDay + account.firstPaymentDays + 2;
                account.upgradeDay = 0;
              }
              break;
            }
          }
        }

        // Περιμένει για upgrade
        if (account.status === "upgrade" && day >= account.upgradeDay) {
          account.status = "active";
          account.upgradeDay = 0;
          account.startingDay = day;
        }

        // Placeholder για payout logic (θα μπει αργότερα)
        if (account.status === "payout" && day >= account.payoutDay) {
          account.numberOfPayouts++;
          if (account.bonusAmount !== 0 && !account.bonusTaken && account.totalProfits >= 5) {
            treasury += account.bonusAmount;
            account.bonusTaken = true;
          }
          if (!account.refundTaken && account.numberOfPayouts === account.refundPayoutNumber) {
            treasury += account.refundAmount;
            account.refundTaken = true;
          }
          treasury += (account.balance - account.capital) * 0.8;
          account.balance = account.capital;
          account.totalProfits += (100 * (account.balance - account.capital)) / account.capital;
          account.status = "active";
        }
      });
      if ((day + 1) % 30 === 0) {
        newMonthlyReports.push({
          month: (day + 1) / 30,
          treasury,
          minTreasury,
          totalAccounts,
        });
      }
    }

    setResults({
      treasury,
      minTreasury,
      totalAccounts,
    });

    setMonthlyReports(newMonthlyReports);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-4xl mb-4 p-4 border rounded shadow bg-white">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">⚙️ Settings</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col">
            <span className="text-sm text-gray-700 mb-1">Payout στόχος (%):</span>
            <input type="number" min="0" max="100" value={payoutTargetPercent} onChange={(e) => setPayoutTargetPercent(Number(e.target.value))} className="border p-1 rounded outline-none" />
          </label>

          <label className="flex flex-col col-span-full sm:col-span-1">
            <span className="text-sm text-gray-700 mb-1">Μήνες προσομοίωσης:</span>
            <input type="number" min="1" max="365" value={monthsToSimulate} onChange={(e) => setMonthsToSimulate(Number(e.target.value))} className="border p-1 rounded outline-none" />
          </label>

          <label className="flex flex-col col-span-full sm:col-span-1">
            <span className="text-sm text-gray-700 mb-1">Trades ανά ημέρα:</span>
            <input type="number" min="1" max="6" value={tradesPerDay} onChange={(e) => setTradesPerDay(Number(e.target.value))} className="border p-1 rounded outline-none" />
          </label>

          <label className="flex flex-col col-span-full sm:col-span-1">
            <span className="text-sm text-gray-700 mb-1">Ρίσκο Phase 1 (%):</span>
            <input type="number" min="1" max="6" step={0.1} value={phase1Risk} onChange={(e) => setPhase1Risk(Number(e.target.value))} className="border p-1 rounded outline-none" />
          </label>

          <label className="flex flex-col col-span-full sm:col-span-1">
            <span className="text-sm text-gray-700 mb-1">Ρίσκο Phase 2 (%):</span>
            <input type="number" min="1" max="6" step={0.1} value={phase2Risk} onChange={(e) => setPhase2Risk(Number(e.target.value))} className="border p-1 rounded outline-none" />
          </label>

          <label className="flex flex-col col-span-full sm:col-span-1">
            <span className="text-sm text-gray-700 mb-1">Ρίσκο Phase 3 (%):</span>
            <input type="number" min="1" max="6" step={0.1} value={phase3Risk} onChange={(e) => setPhase3Risk(Number(e.target.value))} className="border p-1 rounded outline-none" />
          </label>
        </div>
      </div>

      <div className="mb-4 text-3xl font-semibold text-green-700 border rounded shadow max-w-4xl w-full p-4 text-center">Budget: ${budget}</div>
      <div className="mb-4 text-3xl font-semibold text-green-700 border rounded shadow max-w-4xl w-full p-4 text-center">Accounts: {totalAccounts}</div>
      <div className="mb-4 text-3xl font-semibold text-green-700 border rounded shadow max-w-4xl w-full p-4 text-center">Capital: ${totalCapital}</div>

      <div className="w-full max-w-4xl space-y-8">
        {Object.entries(companies).map(([companyKey, company]) => (
          <div key={companyKey} className="border rounded-xl shadow p-4">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">{company.name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(company.accounts).map(([accountSize, data]) => {
                const key = `${companyKey}-${accountSize}`;
                const count = selectedCounts[key] || 0;

                return (
                  <div key={key} className="relative bg-gray-100 p-3 rounded-lg shadow hover:bg-blue-100 transition">
                    {/* Πλήθος επιλεγμένων */}
                    {count > 0 && <div className="absolute top-4 right-10 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">x{count}</div>}

                    {/* Προσθήκη */}
                    <button className="absolute top-2 right-2 text-green-600 hover:text-green-800 text-sm" onClick={() => handleSelect(companyKey, accountSize, data)}>
                      ➕
                    </button>

                    {/* Αφαίρεση */}
                    {count > 0 && (
                      <button className="absolute top-8 right-2 text-red-500 hover:text-red-700 text-sm" onClick={() => handleRemove(companyKey, accountSize, data)}>
                        ➖
                      </button>
                    )}

                    <div className="text-lg font-medium">${accountSize}</div>
                    <div className="text-sm text-gray-700">Price: ${data.price}</div>
                    {data.bonus && <div className="text-sm text-green-600">Bonus: ${data.bonus}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="w-full max-w-4xl mt-10 p-4 border rounded shadow bg-white">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">🧾 Επιλεγμένα Accounts</h2>

        {Object.keys(selectedCounts).length === 0 ? (
          <p className="text-gray-500">Δεν έχει επιλεγεί κανένα account.</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(selectedCounts).map(([key, count]) => {
              const [companyKey, accountSize] = key.split("-");
              const company = companies[companyKey];
              const data = company?.accounts?.[accountSize];

              if (!data) return null;

              const totalCost = count * data.price;

              return (
                <li key={key} className="flex justify-between items-center border-b pb-1">
                  <div>
                    <div className="font-medium text-gray-800">
                      {company.name} - ${accountSize}
                    </div>
                    <div className="text-sm text-gray-600">
                      Πλήθος: x{count} | Τιμή μονάδας: ${data.price} | Σύνολο: ${totalCost}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <button onClick={SimulationExecution} className="mt-4 bg-blue-500 text-white p-4 rounded font-bold text-2xl hover:bg-blue-600 w-full max-w-4xl">
        Εκτέλεση
      </button>

      <div className="mb-4 text-3xl font-semibold text-purple-700 border rounded shadow max-w-4xl w-full p-4 text-center">Κέρδη: ${results.treasury.toFixed(2)}</div>
      <div className="mb-4 text-3xl font-semibold text-red-700 border rounded shadow max-w-4xl w-full p-4 text-center">Backup κεφάλαιο: ${results.minTreasury.toFixed(2)}</div>
      <div className="mb-4 text-3xl font-semibold text-indigo-700 border rounded shadow max-w-4xl w-full p-4 text-center">Συνολικά accounts που αγοράστηκαν: {results.totalAccounts}</div>

      {monthlyReports.length > 0 && (
        <div className="w-full max-w-4xl mt-10 p-4 border rounded shadow bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Μηνιαία Αναφορά</h2>
          <ul className="space-y-2">
            {monthlyReports.map((report) => (
              <li key={`${report.month}-${report.treasury}-${report.totalAccounts}`} className="p-3 border-b text-gray-700">
                <div className="font-semibold">Μήνας {report.month}</div>
                <div>📦 Ταμείο: ${report.treasury.toFixed(2)}</div>
                <div>🔻 Ελάχιστο Ταμείο: ${report.minTreasury.toFixed(2)}</div>
                <div>🧾 Accounts συνολικά: {report.totalAccounts}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FastAsHell;
