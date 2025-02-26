"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { OpenTicket } from "@/library/TicketActions";

const OpenTicketForm = ({ user, sender, account, trade, invoice, notifyUser, notifyAdmin }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const Open = async () => {
    const response = await OpenTicket({ user, sender, account, trade, invoice, notifyUser, notifyAdmin, message, subject });
    if (response.error) {
      toast.error(response.message);
    } else {
      setSubject("");
      setMessage("");
    }
  };
  return (
    <div className="w-full m-auto border border-gray-300 p-4 rounded flex flex-col gap-2 h-full">
      <div className="text-center text-sm text-gray-400 mb-2">Άνοιξε Νέο Ticket</div>
      <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input rounded" type="text" placeholder="Θέμα" maxLength={35} />
      {account && <input value={account} readOnly className="input rounded" type="text" />}
      {trade && <input value={trade} readOnly className="input rounded" type="text" />}
      {invoice && <input value={invoice} readOnly className="input rounded" type="text" />}
      <textarea maxLength={250} value={message} onChange={(e) => setMessage(e.target.value)} className="input rounded" type="text" placeholder="Μήνυμα" />
      <button onClick={Open} className="w-full bg-blue-500 p-4 text-white text-xl rounded hover:bg-blue-600 transition-colors duration-300">
        ✔
      </button>
    </div>
  );
};

export default OpenTicketForm;
