"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const PayoutForm = ({ SendPayout, accountProfits, userProfits, userDept, userSharePercent, accountId }) => {
  const [payout, setPayout] = useState("");

  const [userShare, setUserShare] = useState("");
  const [leaderDept, setLeaderDept] = useState("");
  const [teamDept, setTeamDept] = useState("");
  const [userReport, setUserReport] = useState("");

  const [calculated, setCalculated] = useState(false);

  const Send = async () => {
    const response = await SendPayout({ accountId, payoutAmount: Math.floor(Number(payout)), userShare, leaderDept, teamDept, userReport });
    if (response.error) toast.error(response.message);
  };

  const Calculate = () => {
    const payoutAmount = Math.floor(Number(payout));

    if (payoutAmount > accountProfits * 5 || payoutAmount < accountProfits * 0.5) {
      toast.warn("Λάθος ποσό payout");
      return;
    }

    // Αν δεν έχει ποσοστό δεν θα υπολογιστεί ότι θα κρατήσει κάτι
    let userShareAmount = Math.floor((payoutAmount * userSharePercent) / 100);
    if (userShareAmount === 0) {
      setUserReport(`Δεν κρατάς ποσοστό. Στείλε $${payoutAmount}.`);
      setUserShare(0);
      setLeaderDept(0);
      setTeamDept(0);
      return;
    }

    let userReportTemp = `Το ποσοστό σου είναι ${userSharePercent}%, άρα το μερίδιο σου είναι $${userShareAmount}.`;

    const isThereDeptForPage = userProfits < 0 ? true : false;
    const isThereExtraProfit = userProfits > 0 ? true : false;

    // --> Team Dept
    if (isThereExtraProfit) {
      userShareAmount += userProfits;
      userReportTemp = userReportTemp + ` Έχεις και έξτρα profits $${userProfits}, οπότε το μερίδιο σου διαμορφώνεται στα $${userShareAmount}.`;
      setTeamDept(-userProfits);
    }

    if (userProfits === 0) setTeamDept(0);

    if (isThereDeptForPage) {
      if (userShareAmount >= Math.abs(userProfits)) {
        userShareAmount += userProfits;
        userReportTemp = userReportTemp + ` Έχεις χρέος στην σελίδα $${Math.abs(userProfits)}, οπότε το μερίδιο σου διαμορφώνεται στα $${userShareAmount}.`;
        setTeamDept(Math.abs(userProfits));
      } else {
        setTeamDept(userShareAmount);
        userShareAmount = 0;
        userReportTemp = userReportTemp + ` Έχεις χρέος στην σελίδα $${Math.abs(userProfits)}, οπότε δεν σου μένει μερίδιο.`;
      }
    }

    if (userDept > 0 && userShareAmount > 0) {
      if (userShareAmount >= userDept) {
        userShareAmount -= userDept;
        userReportTemp = userReportTemp + ` Έχεις χρέος στην ομάδα σου $${userDept}, οπότε το μερίδιο σου διαμορφώνεται στα $${userShareAmount}`;
        setLeaderDept(userDept);
      } else {
        setLeaderDept(userShareAmount);
        userShareAmount = 0;
        userReportTemp = userReportTemp + ` Έχεις χρέος στην ομάδα σου $${Math.abs(userDept)}, οπότε δεν σου μένει μερίδιο.`;
      }
    } else {
      setLeaderDept(0);
    }

    setUserShare(userShareAmount);
    setUserReport(userReportTemp);
    setCalculated(true);
    return;
  };

  return (
    <div className="w-full max-w-[500px] m-auto flex flex-col gap-2 bg-gray-50 border border-gray-300 p-4 rounded">
      <div>Account Profits: {accountProfits}</div>
      <div>User Profits: {userProfits}</div>
      <div>User Dept: {userDept}</div>
      <div>User Share Percentage: {userSharePercent}</div>
      <div>Account ID: {accountId}</div>
      <div className="text-sm text-gray-500">Το ποσό που μπήκε στο wallet:</div>
      <input onChange={(e) => setPayout(e.target.value)} disabled={calculated} placeholder="Payout" className="input rounded" type="number" value={payout} />
      {!calculated && (
        <button onClick={Calculate} className="bg-blue-500 text-white font-bold px-4 py-4 text-center hover:bg-blue-600 transition-colors duration-300 rounded">
          Υπολογισμός
        </button>
      )}
      {calculated && (
        <>
          <div className="text-justify text-gray-500">{userReport}</div>
          {userSharePercent > 0 && (
            <div className="text-center text-2xl font-bold py-2 animate-bounce">
              Κρατάς: ${userShare} και στέλνεις ${payout - userShare}
            </div>
          )}
          {userSharePercent === 0 && <div className="text-center text-2xl font-bold py-2 animate-bounce">Στέλνεις ${payout - userShare}</div>}
          <button onClick={Send} className="bg-blue-500 text-white text-lg font-bold px-4 py-4 text-center hover:bg-blue-600 transition-colors duration-300 rounded">
            ΤΑ ΕΣΤΕΙΛΑ
          </button>
        </>
      )}
      <div>User Share: {userShare}</div>
      <div>Leader Dept: {leaderDept}</div>
      <div>Team Dept: {teamDept}</div>
    </div>
  );
};

export default PayoutForm;
