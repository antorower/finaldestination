"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const CreateUpgradedAccount = ({ UpgradeAccount, passedAccountNumber, passedAccountId, phase, capital, user, company }) => {
  const [number, setNumber] = useState("");
  const router = useRouter();

  const Upgrade = async () => {
    const response = await UpgradeAccount({ number, passedAccountNumber, passedAccountId, phase, capital, user, company });
    if (response) {
      toast.success("Account successfully upgraded");
      router.refresh();
    } else {
      toast.warn("Something went wrong");
    }
  };
  return (
    <div className="border border-gray-700 p-4 flex flex-col gap-4 rounded">
      <input type="text" required value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Account Number" className="input" />
      <button className="bg-blue-500 p-4 rounded font-black w-full" onClick={Upgrade}>
        Upgrade
      </button>
    </div>
  );
};

export default CreateUpgradedAccount;
