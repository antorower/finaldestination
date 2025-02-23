"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const UpdateDayStringDate = ({ day, stringDate, UpdateStringDate }) => {
  const [date, setDate] = useState("");

  useEffect(() => {
    if (stringDate) setDate(stringDate);
  }, [stringDate]);

  const Update = async () => {
    const response = await UpdateStringDate({ day, stringDate: date });
    if (response.error) toast.error(response.message);
  };

  return (
    <div className="flex flex-col gap-2 w-[200px]">
      <input value={date} onChange={(e) => setDate(e.target.value)} className="input" placeholder="Day" />
      <button onClick={Update} className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2">
        ✔
      </button>
    </div>
  );
};

export default UpdateDayStringDate;
