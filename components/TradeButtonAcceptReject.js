"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import Link from "next/link";

const TradeButtonAcceptReject = ({ text, accept, reject, trader, trade, SubmitTrade, acceptPoints, rejectPoints, account }) => {
  const [isDisabled, setIsDisabled] = useState(false);

  const Submit = async () => {
    setIsDisabled(true);
    const response = SubmitTrade({ userId: trader, account, tradeId: trade, points: accept ? acceptPoints : rejectPoints, action: accept ? "accept" : "reject" });
    if (response) {
      const text = accept ? "Trade accepted successfully" : "Trade rejected successfully";
      toast.success(text);
    } else {
      toast.error("Something went wrong. Try again");
      setIsDisabled(false);
    }
  };

  let points;
  if (accept) points = `(+${acceptPoints})`;
  if (reject) points = `(${rejectPoints})`;

  return (
    <button onClick={Submit} disabled={isDisabled} className={`${accept && "bg-green-600"} ${reject && "bg-red-600"} w-full text-center px-2 py-1 rounded font-bold hover:scale-105 transition-transform duration-300 text-nowrap`}>
      {text} {points}
    </button>
  );
};

export default TradeButtonAcceptReject;
