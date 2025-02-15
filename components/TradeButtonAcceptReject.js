"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import Link from "next/link";

const TradeButtonAcceptReject = ({ text, accept, trader, trade, SubmitTrade, account, points }) => {
  const [isDisabled, setIsDisabled] = useState(false);

  const Submit = async () => {
    setIsDisabled(true);
    const response = SubmitTrade({ userId: trader, account, tradeId: trade, points, action: accept ? "accept" : "reject" });
    if (response) {
      const text = accept ? "Trade accepted successfully" : "Trade rejected successfully";
      toast.success(text);
    } else {
      toast.error("Something went wrong. Try again");
      setIsDisabled(false);
    }
  };

  return (
    <button onClick={Submit} disabled={isDisabled} className={`${accept && "bg-green-600"} ${!accept && "bg-red-600"} w-full text-center px-2 py-1 rounded font-bold hover:scale-105 transition-transform duration-300 text-nowrap`}>
      {text}
      <span className="ml-1">
        {accept && points > 0 && `(+${points} EP)`} {!accept && points < 0 && `(${points} EP)`}
      </span>
    </button>
  );
};

export default TradeButtonAcceptReject;
