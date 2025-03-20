"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const UpdateCloseHour = ({ day, closeHour, closeMinutes, UpdateDayCloseHour }) => {
  const [hour, setHour] = useState("");
  const [minutes, setMinutes] = useState("");

  useEffect(() => {
    if (closeHour) setHour(closeHour);
    if (closeMinutes) setMinutes(closeMinutes);
  }, [closeHour, closeMinutes]);

  const Update = async () => {
    const response = await UpdateDayCloseHour({ day, closeHour: hour, closeMinutes: minutes });
    if (response.error) toast.error(response.message);
  };

  return (
    <div className="flex flex-col gap-2 w-[200px]">
      <div className="flex gap-4 items-center">
        <input value={hour} onChange={(e) => setHour(e.target.value)} className="input" placeholder="Hour" />
        <input value={minutes} onChange={(e) => setMinutes(e.target.value)} className="input" placeholder="Minutes" />
      </div>
      <button onClick={Update} className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2">
        ✔
      </button>
    </div>
  );
};

export default UpdateCloseHour;
