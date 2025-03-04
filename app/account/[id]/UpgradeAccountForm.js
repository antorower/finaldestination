"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";

const UpgradeAccountForm = ({ UpgradeAccount, account }) => {
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [server, setServer] = useState("");

  const Upgrade = async () => {
    const response = await UpgradeAccount({ accountId: account, newNumber: newAccountNumber, login, password, server });
    if (response.error) toast.error(response.message);
  };

  return (
    <div className="w-full max-w-[300px] m-auto flex flex-col gap-2">
      <input value={newAccountNumber} onChange={(e) => setNewAccountNumber(e.target.value)} className="input rounded" type="text" placeholder="New Account Number" />
      <input value={login} onChange={(e) => setLogin(e.target.value)} className="input rounded" type="text" placeholder="Login" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} className="input rounded" type="text" placeholder="Password" />
      <input value={server} onChange={(e) => setServer(e.target.value)} className="input rounded" type="text" placeholder="Server" />
      <button onClick={Upgrade} className="bg-blue-500 rounded w-full text-white p-2 hover:bg-blue-600">
        ✔
      </button>
    </div>
  );
};

export default UpgradeAccountForm;
