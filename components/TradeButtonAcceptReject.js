"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import Link from "next/link";

const TradeButtonAcceptReject = ({ accept, reject, trader, trade }) => {
  return <button className={`${accept && "bg-green-500"} ${reject && "bg-red-500"} w-full text-center px-2 py-1 rounded`}>Accept</button>;
};

export default TradeButtonAcceptReject;
