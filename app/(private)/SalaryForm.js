"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const SalaryForm = ({ userSalary, userId, SaveSalary }) => {
  const [salary, setSalary] = useState("");

  const Save = async () => {
    const response = await SaveSalary({ userId, salary });
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success("Ο μισθός άλλαξε");
    }
  };

  useEffect(() => {
    if (userSalary) setSalary(userSalary);
  }, [userSalary]);

  return (
    <div>
      <input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="Μισθός" className="input rounded" />
      <button onClick={Save} className="bg-blue-500 text-white px-4 py-2 w-full transition-colors duration-300 hover:bg-blue-600 rounded mt-2">
        ✔
      </button>
    </div>
  );
};

export default SalaryForm;
