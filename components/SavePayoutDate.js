"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";

const SavePayoutDate = ({ number, SaveDate }) => {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const Save = async () => {
    if (!day || !month || !year) {
      toast.warn("Πρέπει να εισάγεις ημερομηνία");
      return;
    }

    const numberDay = Number(day);
    const numberMonth = Number(month);
    const numberYear = Number(year);

    // Έλεγχος αν είναι αριθμοί και αν έχουν λογικές τιμές
    if (isNaN(numberDay) || numberDay < 1 || numberDay > 31) {
      toast.warn("Η ημέρα πρέπει να είναι αριθμός μεταξύ 1 και 31");
      return;
    }

    if (isNaN(numberMonth) || numberMonth < 1 || numberMonth > 12) {
      toast.warn("Ο μήνας πρέπει να είναι αριθμός μεταξύ 1 και 12");
      return;
    }

    const currentYear = new Date().getFullYear();
    if (isNaN(numberYear) || numberYear < 1900 || numberYear > currentYear + 1) {
      toast.warn(`Το έτος πρέπει να είναι μεταξύ 1900 και ${currentYear + 1}`);
      return;
    }

    const response = await SaveDate({ number, day: numberDay, month: numberMonth, year: numberYear });
    if (!response) toast.error("Κάτι πήγε στραβά. Κάνε refresh και προσπάθησε ξανά.");
  };

  return (
    <div className="border border-gray-700 p-4 flex flex-col gap-4 rounded">
      <div className="flex gap-4 items-center">
        <input type="number" required value={day} onChange={(e) => setDay(e.target.value)} placeholder="Day" className="input" />
        <input type="number" required value={month} onChange={(e) => setMonth(e.target.value)} placeholder="Month" className="input" />
        <input type="number" required value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" className="input" />
      </div>
      <button className="bg-blue-500 p-4 rounded font-black w-full" onClick={Save}>
        &#128190;
      </button>
    </div>
  );
};

export default SavePayoutDate;
