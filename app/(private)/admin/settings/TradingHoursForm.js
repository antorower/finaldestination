"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const TradingHoursForm = ({ UpdateTradingHours, currentStartingHour, currentEndingHour }) => {
  const [startingHour, setStartingHour] = useState("");
  const [endingHour, setEndingHour] = useState("");

  const Update = async () => {
    const response = await UpdateTradingHours({ startingHour, endingHour });
    if (response.error) toast.error(response.message);
  };

  useEffect(() => {
    if (currentStartingHour) setStartingHour(currentStartingHour);
    if (currentEndingHour) setEndingHour(currentEndingHour);
  }, [currentStartingHour, currentEndingHour]);

  return (
    <div className="flex flex-col gap-2 border border-gray-300 p-4 rounded-lg">
      <div className="text-center text-gray-500">
        Trading: {currentStartingHour}:00 - {currentEndingHour}:00
      </div>
      <div className="flex items-center gap-2">
        <input value={startingHour} onChange={(e) => setStartingHour(e.target.value)} className="input rounded" type="number" placeholder="Starting Hour" />
        <input value={endingHour} onChange={(e) => setEndingHour(e.target.value)} className="input rounded" type="number" placeholder="Starting Hour" />
      </div>
      <button onClick={Update} className="w-full px-4 py-2 bg-blue-500 text-white text-lg rounded">
        ✔
      </button>
    </div>
  );
};

export default TradingHoursForm;
