"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";

const UpdateDayHours = ({ day, UpdateHours }) => {
  const [startingHour, setStartingHour] = useState("");
  const [endingHour, setEndingHour] = useState("");

  const Update = async () => {
    if (!startingHour || !endingHour) {
      toast.error("Πρέπει να επιλέξεις ώρα!");
      return;
    }
    const response = await UpdateHours({ day, startingHour, endingHour });
    if (response.error) toast.error(response.message);
  };

  return (
    <div className="flex flex-col gap-2 w-[200px]">
      <div className="flex gap-2">
        <input value={startingHour} onChange={(e) => setStartingHour(e.target.value)} type="number" placeholder="Start" className="input" />
        <input value={endingHour} onChange={(e) => setEndingHour(e.target.value)} type="number" placeholder="End" className="input" />
      </div>
      <button onClick={Update} className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2">
        ✔
      </button>
    </div>
  );
};

export default UpdateDayHours;
