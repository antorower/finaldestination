"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const WorkingHours = ({ name, startingTradingHour, endingTradingHour, userStatus, ChangeHours, ChangeStatus, userId }) => {
  const [startingHour, setStartingHour] = useState(startingTradingHour || "");
  const [endingHour, setEndingHour] = useState(endingTradingHour || "");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (startingTradingHour && endingTradingHour) {
      setExpanded(false);
    } else {
      setExpanded(true);
    }
  }, []);

  const SaveHours = async () => {
    if (endingHour <= startingHour) {
      toast.warn("Οι ώρες που εισάγεις δεν έχουν λογική.");
      setExpanded(false);
      return;
    }

    if (startingHour < 4) {
      toast.warn("Τα trades ξεκινάνε από τις 4 και μετά");
      setExpanded(false);
      return;
    }

    if (startingHour > 9) {
      toast.warn("Δεν μπορείς να βάλεις ώρα εκκίνησης αργότερη της 9ης πρωινής");
      setExpanded(false);
      return;
    }

    if (endingHour > 10) {
      toast.warn("Δεν μπορείς να βάλεις ώρα λήξης αργότερη της 10ης πρωινής");
      setExpanded(false);
      return;
    }

    const response = await ChangeHours({ userId, startingHour, endingHour });
    if (response) {
      setExpanded(false);
    } else {
      toast.warn("Hours were not updated");
    }
  };

  const SaveStatus = async () => {
    const response = await ChangeStatus({ userId });
    if (response) {
      setExpanded(false);
    } else {
      toast.warn("Status were not updated");
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-[500px] m-auto items-center">
      <button onClick={SaveStatus} className="flex items-center gap-2">
        <div className="text-xl">{userStatus && userStatus === "active" ? "✅" : "⛔"}</div>
        <div className={`text-2xl ${userStatus === "active" ? "text-green-300 border-green-700" : "text-red-300 border-red-700"}`}>{name}</div>
      </button>
      {!expanded && (
        <>
          <button onClick={() => setExpanded(true)} className={`${userStatus === "active" ? "text-green-300 border-green-700" : "text-red-300 border-red-700"} px-4 py-2 rounded border-2`}>
            Trading Hours: {startingTradingHour}:00 - {endingTradingHour}:00
          </button>
        </>
      )}
      {expanded && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <input type="number" required value={startingHour} onChange={(e) => setStartingHour(e.target.value)} placeholder="Starting" className="bg-gray-900 border w-[80px] border-gray-700 text-gray-400  placeholder:text-gray-500 px-3 py-2 focus:outline focus:outline-1 focus:outline-gray-600;" />
            <div> - </div>
            <input type="number" required value={endingHour} onChange={(e) => setEndingHour(e.target.value)} placeholder="Ending" className="bg-gray-900 border w-[80px] border-gray-700 text-gray-400  placeholder:text-gray-500 px-3 py-2 focus:outline focus:outline-1 focus:outline-gray-600;" />
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={SaveHours} className="border w-[70%] border-green-600 bg-green-700 rounded hover:bg-green-800 px-4 py-2">
              ✔
            </button>
            <button onClick={() => setExpanded(false)} className="border w-[30%] border-gray-700 bg-gray-800 rounded hover:bg-gray-900 px-4 py-2">
              ❌
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkingHours;
