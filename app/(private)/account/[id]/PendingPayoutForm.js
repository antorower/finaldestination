"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const PendingPayoutForm = ({ accountId, date, SavePayoutDate }) => {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Λίστες για τα dropdown menus
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 2 }, (_, i) => currentYear + i); // Τελευταία 10 χρόνια

  // Όταν αλλάζει το `date` (αν υπάρχει)
  useEffect(() => {
    if (date) {
      const parsedDate = new Date(date);
      setDay(parsedDate.getDate().toString());
      setMonth((parsedDate.getMonth() + 1).toString()); // Μήνες ξεκινάνε από 0
      setYear(parsedDate.getFullYear().toString());
    }
  }, [date]);

  // Αποθήκευση ημερομηνίας
  const Save = async () => {
    if (!day || !month || !year) {
      toast.error("Συμπλήρωσε όλα τα πεδία");
      return;
    }

    const formattedDate = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00Z`);

    const response = await SavePayoutDate({ accountId, date: formattedDate });

    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success("Η ημερομηνία αποθηκεύτηκε επιτυχώς");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 bg-gray-50 m-auto border border-gray-300 rounded-lg p-4 max-w-[500px]">
      <div>Αποθήκευση Ημερομηνίας Πληρωμής</div>
      <div className="text-gray-500 text-sm max-w-[400px] text-center">Πήγαινε στην ιστοσελίδα της εταιρίας, βρες την ημερομηνία πληρωμής και αποθήκευσέ την στην παρακάτω φόρμα.</div>
      <div className="flex gap-2">
        {/* Επιλογή ημέρας */}
        <select className="p-2 border rounded" value={day} onChange={(e) => setDay(e.target.value)}>
          <option value="">Ημέρα</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Επιλογή μήνα */}
        <select className="p-2 border rounded" value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">Μήνας</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* Επιλογή έτους */}
        <select className="p-2 border rounded" value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Έτος</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Κουμπί αποθήκευσης */}
      <button onClick={Save} className="px-4 py-2 bg-blue-500 transition-colors duration-300 text-white rounded w-full hover:bg-blue-600">
        ✔
      </button>
    </div>
  );
};

export default PendingPayoutForm;
