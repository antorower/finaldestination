"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const DayNote = ({ day, UpdateDayNote }) => {
  const [note, setNote] = useState("");
  const router = useRouter();

  const UpdateNote = async () => {
    const response = await UpdateDayNote({ day: day, note: note });
    if (response) {
      toast.success("Note updated");
      router.refresh();
    } else {
      toast.error("Something went wrong");
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-2 border border-gray-900 p-2 mb-4">
      <input type="text" required value={note} onChange={(e) => setNote(e.target.value)} placeholder="Day Note" className="input" />
      <button type="button" onClick={UpdateNote} className="bg-blue-500 text-white px-4 py-2 rounded w-full">
        Save
      </button>
    </div>
  );
};

export default DayNote;
