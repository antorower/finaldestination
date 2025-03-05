"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";

const UpdateMaxAccountsForm = ({ UpdateMaxAccount, companyId }) => {
  const [maxAccounts, setMaxAccounts] = useState("");

  const Update = async () => {
    const response = await UpdateMaxAccount({ companyId, maxAccounts });
    if (response.error) toast.error(response.message);
    setMaxAccounts("");
  };

  return (
    <div className="flex flex-col gap-2">
      <input value={maxAccounts} onChange={(e) => setMaxAccounts(e.target.value)} type="text" placeholder="Max Accounts" className="input" />
      <button onClick={Update} className="w-full bg-blue-500 p-2 text-white">
        ✔
      </button>
    </div>
  );
};

export default UpdateMaxAccountsForm;
