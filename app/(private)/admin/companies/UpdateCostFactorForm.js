"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";

const UpdateCostFactorForm = ({ UpdateCostFactor, companyId }) => {
  const [costFactor, setCostFactor] = useState("");

  const Update = async () => {
    const response = await UpdateCostFactor({ companyId, costFactor });
    if (response.error) toast.error(response.message);
    setCostFactor("");
  };

  return (
    <div className="flex flex-col gap-2">
      <input value={costFactor} onChange={(e) => setCostFactor(e.target.value)} type="number" placeholder="Cost Factor" className="input" />
      <button onClick={Update} className="w-full bg-blue-500 p-2 text-white">
        ✔
      </button>
    </div>
  );
};

export default UpdateCostFactorForm;
