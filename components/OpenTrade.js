"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const OpenTrade = ({ trade, user, Open }) => {
  const OpenTrade = async () => {
    const response = await Open({ trade, user });
    if (response) {
      toast.success("Το trade σου είναι έτοιμο");
    } else {
      toast.error("Κάτι πήγες στραβά. Κάνε refresh και προσπάθησε ξανά.");
    }
  };

  return (
    <button onClick={OpenTrade} className="bg-blue-500 w-full py-2 rounded font-bold hover:scale-105 transition-transform duration-300">
      Άνοιγμα
    </button>
  );
};

export default OpenTrade;
