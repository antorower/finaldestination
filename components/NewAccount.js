"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";

const NewAccount = ({ admin, id, SaveNewAccount, DeleteAccount }) => {
  const [number, setNumber] = useState("");

  const SaveAccount = async () => {
    if (!number) {
      toast.warn("Συμπλήρωσε το νούμερο του account");
      return;
    }

    const response = await SaveNewAccount({ number, id });
    if (!response) {
      toast.warn("Κάτι πήγε στραβά, κάνε refresh και προσπάθησε ξανά");
    }
  };

  const Delete = async () => {
    const response = await DeleteAccount({ id });
    if (!response) {
      toast.warn("Κάτι πήγε στραβά, κάνε refresh και προσπάθησε ξανά");
    }
  };

  return (
    <div className="border border-gray-700 p-4 flex flex-col gap-4 rounded">
      <input type="text" required value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Account Number" className="input" />
      <button className="bg-blue-500 p-4 rounded font-black w-full" onClick={SaveAccount}>
        &#128190;
      </button>
      {admin && (
        <button className="bg-red-500 p-4 rounded font-black w-full" onClick={Delete}>
          ❌
        </button>
      )}
    </div>
  );
};

export default NewAccount;
