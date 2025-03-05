"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";

const SaveAccountNumberForm = ({ SaveNewAccountNumber, accountId }) => {
  const [newNumber, setNewNumber] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [server, setServer] = useState("");

  const Save = async () => {
    const response = await SaveNewAccountNumber({ accountId, newNumber, login, password, server });
    if (response.error) toast.error(response.message);
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-[220px]">
      <input value={newNumber} onChange={(e) => setNewNumber(e.target.value)} type="text" className="input rounded" placeholder="Αριθμός Account" />
      <input value={login} onChange={(e) => setLogin(e.target.value)} type="text" className="input rounded" placeholder="Login" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="text" className="input rounded" placeholder="Password" />
      <input value={server} onChange={(e) => setServer(e.target.value)} type="text" className="input rounded" placeholder="Server" />
      <button onClick={Save} className="w-full text-center bg-blue-500 rounded text-white p-2 hover:bg-blue-600 transition-colors duration-300">
        ✔
      </button>
    </div>
  );
};

export default SaveAccountNumberForm;
