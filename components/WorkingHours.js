"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Link from "next/link";

const WorkingHours = ({ startingTradingHour, endingTradingHour, userStatus, ChangeHours, ChangeStatus, userId }) => {
  const [startingHour, setStartingHour] = useState(startingTradingHour || "");
  const [endingHour, setEndingHour] = useState(endingTradingHour || "");
  const [status, setStatus] = useState(userStatus || "inactive");
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
      toast.success("Hours updated successfully");
      setExpanded(false);
    } else {
      toast.warn("Hours were not updated");
    }
  };

  const SaveStatus = async () => {
    const response = await ChangeStatus({ userId });
    if (response) {
      toast.success("Status updated successfully");
      setExpanded(false);
    } else {
      toast.warn("Status were not updated");
    }
  };

  return (
    <div className="flex gap-4 max-w-[500px] m-auto items-center">
      {!expanded && (
        <>
          <button onClick={() => setExpanded(true)} className={`${userStatus === "active" ? "text-green-300 border-green-700" : "text-red-300 border-red-700"} px-4 py-2 rounded border-2`}>
            Trading Hours: {startingTradingHour}:00 - {endingTradingHour}:00
          </button>
          <button onClick={SaveStatus} className={`border px-4 rounded py-2 ${userStatus === "active" ? "bg-green-700 border-2 border-green-900" : "bg-red-700 border-2 border-red-900"}`}>
            {userStatus && userStatus === "active" ? "Είσαι ενεργός" : "Είσαι ανενεργός"}
          </button>
        </>
      )}
      {expanded && (
        <>
          <input type="number" required value={startingHour} onChange={(e) => setStartingHour(e.target.value)} placeholder="Starting" className="input" />
          -
          <input type="number" required value={endingHour} onChange={(e) => setEndingHour(e.target.value)} placeholder="Ending" className="input" />
          <button onClick={SaveHours} className="border border-gray-700 px-4 py-2">
            Save
          </button>
        </>
      )}
    </div>
  );
};

export default WorkingHours;
