"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";

const UpdateMaxLotsForm = ({ UpdateMaxLots, companyId }) => {
  const [maxLots, setMaxLots] = useState("");

  const Update = async () => {
    const response = await UpdateMaxLots({ companyId, maxLots });
    if (response.error) toast.error(response.message);
    setMaxLots("");
  };

  return (
    <div className="flex flex-col gap-2">
      <input value={maxLots} onChange={(e) => setMaxLots(e.target.value)} type="text" placeholder="Max Lots" className="input" />
      <button onClick={Update} className="w-full bg-blue-500 p-2 text-white">
        ✔
      </button>
    </div>
  );
};

export default UpdateMaxLotsForm;
