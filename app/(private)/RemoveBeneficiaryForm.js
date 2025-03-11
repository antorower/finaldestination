"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";

const RemoveBeneficiaryForm = ({ percentage, beneficiaryId, firstName, lastName, RemoveBeneficiary, userId }) => {
  const Remove = async () => {
    const response = await RemoveBeneficiary({ userId, beneficiaryId });
    if (response.error) toast.error(response.message);
  };
  return (
    <button onClick={() => Remove()} className="bg-blue-500 border border-white px-4 py-2 font-bold rounded text-nowrap text-white">
      {firstName} {lastName} - {percentage}%
    </button>
  );
};

export default RemoveBeneficiaryForm;
