"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const PayoutRequestDoneButton = ({ accountId, PayoutRequestDone }) => {
  const Done = async () => {
    const response = await PayoutRequestDone(accountId);
    if (response.error) toast.error(response.message);
  };
  return (
    <button onClick={Done} className="bg-blue-500 text-white rounded transition-colors duration-300 p-4 hover:bg-blue-600 w-full">
      Μόλις Έκανα Payout Request
    </button>
  );
};

export default PayoutRequestDoneButton;
