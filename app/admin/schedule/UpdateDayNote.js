"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const UpdateDayNote = ({ day, dayNote, UpdateNote }) => {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (dayNote) setNote(dayNote);
  }, [dayNote]);

  const Update = async () => {
    const response = await UpdateNote({ day, note });
    if (response.error) toast.error(response.message);
  };

  return (
    <div className="flex flex-col gap-2 w-[200px]">
      <input value={note} onChange={(e) => setNote(e.target.value)} className="input" placeholder="Note" />
      <button onClick={Update} className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2">
        ✔
      </button>
    </div>
  );
};

export default UpdateDayNote;
