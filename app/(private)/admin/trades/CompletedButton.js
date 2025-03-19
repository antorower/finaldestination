"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const CompletedButton = ({ CompleteTrade, tradeId }) => {
  const Complete = async () => {
    const response = await CompleteTrade(tradeId);
    if (response.error) toast.error(response.message);
  };
  return (
    <button onClick={Complete} className=" bg-red-400 w-full text-center text-lg p-2 rounded mt-2 text-white font-bold hover:bg-red-500 transition-colors duration-300">
      Completed
    </button>
  );
};

export default CompletedButton;
