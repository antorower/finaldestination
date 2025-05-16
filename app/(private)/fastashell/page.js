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

const FastAsHell = () => {
  const [selectedCounts, setSelectedCounts] = useState({});
  const [budget, setBudget] = useState(0);

  const [autoRebuy, setAutoRebuy] = useState(true);
  const [strictMatchmaking, setStrictMatchmaking] = useState(false);
  const [tradeCostPercent, setTradeCostPercent] = useState(1);
  const [payoutTargetPercent, setPayoutTargetPercent] = useState(4);
  const [daysToSimulate, setDaysToSimulate] = useState(180);
  const [tradesPerDay, setTradesPerDay] = useState(3);

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

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-4xl mb-4 p-4 border rounded shadow bg-white">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">⚙️ Settings</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={autoRebuy} onChange={(e) => setAutoRebuy(e.target.checked)} />
            <span className="text-sm text-gray-800">Αγορά νέου account αν χαθεί πριν πληρωμή</span>
          </label>

          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={strictMatchmaking} onChange={(e) => setStrictMatchmaking(e.target.checked)} />
            <span className="text-sm text-gray-800">Αυστηρό Matchmaking (βάσει balance)</span>
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700 mb-1">Κόστος συναλλαγής (%):</span>
            <input type="number" min="0" max="100" value={tradeCostPercent} onChange={(e) => setTradeCostPercent(Number(e.target.value))} className="border p-1 rounded outline-none" />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-700 mb-1">Payout στόχος Phase 3 (%):</span>
            <input type="number" min="0" max="100" value={payoutTargetPercent} onChange={(e) => setPayoutTargetPercent(Number(e.target.value))} className="border p-1 rounded outline-none" />
          </label>

          <label className="flex flex-col col-span-full sm:col-span-1">
            <span className="text-sm text-gray-700 mb-1">Ημέρες προσομοίωσης:</span>
            <input type="number" min="1" max="365" value={daysToSimulate} onChange={(e) => setDaysToSimulate(Number(e.target.value))} className="border p-1 rounded outline-none" />
          </label>

          <label className="flex flex-col col-span-full sm:col-span-1">
            <span className="text-sm text-gray-700 mb-1">Trades ανά ημέρα:</span>
            <input type="number" min="1" max="6" value={tradesPerDay} onChange={(e) => setTradesPerDay(Number(e.target.value))} className="border p-1 rounded outline-none" />
          </label>
        </div>
      </div>

      <div className="mb-4 text-3xl font-semibold text-green-700 border rounded shadow max-w-4xl w-full p-4 text-center">Budget: ${budget}</div>

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
                    <button className="absolute top-1 right-1 text-green-600 hover:text-green-800 text-sm" onClick={() => handleSelect(companyKey, accountSize, data)}>
                      ➕
                    </button>

                    {/* Αφαίρεση */}
                    {count > 0 && (
                      <button className="absolute top-8 right-1 text-red-500 hover:text-red-700 text-sm" onClick={() => handleRemove(companyKey, accountSize, data)}>
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
    </div>
  );
};

export default FastAsHell;
