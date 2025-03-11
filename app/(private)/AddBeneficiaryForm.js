"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";

const AddBeneficiaryForm = ({ allUsers, AddBeneficiary, userId }) => {
  const [percentage, setPercentage] = useState("");
  const Add = async (beneficiaryId) => {
    const response = await AddBeneficiary({ userId, beneficiaryId, percentage });
    if (response.error) toast.error(response.message);
  };
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-wrap p-4 justify-center gap-4">
        {allUsers &&
          allUsers.length > 0 &&
          allUsers.map((user) => {
            return (
              <button onClick={() => Add(user._id)} className="bg-blue-500 px-4 py-2 font-bold rounded text-nowrap text-white" key={`allUsers-beneficiarymode-user-${user._id}`}>
                {user.firstName} {user.lastName}
              </button>
            );
          })}
      </div>
      <input value={percentage} onChange={(e) => setPercentage(e.target.value)} max={50} min={1} type="number" placeholder="%" className="input mt-4 max-w-[80px]" />
    </div>
  );
};

export default AddBeneficiaryForm;
