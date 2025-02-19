"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";

const CreateUpgradedAccount = ({ UpgradeAccount, passedAccountNumber, passedAccountId, phase, capital, user, company }) => {
  const [number, setNumber] = useState("");

  const Upgrade = async () => {
    if (!number || number === "" || number == null) {
      toast.warn("Πρέπει να εισάγεις τον αριθμό του νέου account");
    }
    const response = await UpgradeAccount({ number, passedAccountNumber, passedAccountId, phase, capital, user, company });
    if (!response) {
      toast.error("Κάτι πήγε στραβά. Κάνε refresh και προσπάθησε ξανά.");
    }
  };
  return (
    <div className="border border-gray-700 p-4 flex flex-col gap-4 rounded">
      <input type="text" required value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Account Number" className="input" />
      <button className="bg-blue-500 p-4 rounded font-black w-full" onClick={Upgrade}>
        &#128190;
      </button>
    </div>
  );
};

export default CreateUpgradedAccount;
