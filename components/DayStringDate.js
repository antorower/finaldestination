"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const DayStringDate = ({ day, UpdateStringDate }) => {
  const [stringName, setStringName] = useState("");
  const router = useRouter();

  const UpdateDate = async () => {
    const response = await UpdateStringDate({ day: day, stringDate: stringName });
    if (response) {
      toast.success("Date updated");
      router.refresh();
    } else {
      toast.error("Something went wrong");
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-2 border border-gray-900 p-2 mb-4">
      <input type="text" required value={stringName} onChange={(e) => setStringName(e.target.value)} placeholder="Day String" className="input" />
      <button type="button" onClick={UpdateDate} className="bg-blue-500 text-white px-4 py-2 rounded w-full">
        Save
      </button>
    </div>
  );
};

export default DayStringDate;
