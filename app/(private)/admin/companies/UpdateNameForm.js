"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";

const UpdateNameForm = ({ UpdateName, companyId }) => {
  const [name, setName] = useState("");

  const Update = async () => {
    const response = await UpdateName({ companyId, name });
    if (response.error) toast.error(response.message);
    setName("");
  };

  return (
    <div className="flex flex-col gap-2">
      <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Name" className="input" />
      <button onClick={Update} className="w-full bg-blue-500 p-2 text-white">
        ✔
      </button>
    </div>
  );
};

export default UpdateNameForm;
