"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const SpaceForPresenceForm = ({ UpdateMinutesSpaceForPresenceBeforeTrades, currentMinutes }) => {
  const [minutes, setMinutes] = useState("");

  const Update = async () => {
    const response = await UpdateMinutesSpaceForPresenceBeforeTrades({ minutes });
    if (response.error) toast.error(response.message);
  };

  useEffect(() => {
    if (currentMinutes) setMinutes(currentMinutes);
  }, [currentMinutes]);

  return (
    <div className="flex flex-col gap-2 border border-gray-300 p-4 rounded-lg w-full max-w-[350px]">
      <div className="text-center text-gray-500">Minutes For Presence: {currentMinutes}</div>
      <input value={minutes} onChange={(e) => setMinutes(e.target.value)} className="input rounded" type="number" placeholder="Starting Hour" />
      <button onClick={Update} className="w-full px-4 py-2 bg-blue-500 text-white text-lg rounded">
        ✔
      </button>
    </div>
  );
};

export default SpaceForPresenceForm;
