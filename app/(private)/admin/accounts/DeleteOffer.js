"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const DeleteOffer = ({ DeleteTheOffer, accountId, offer }) => {
  const Delete = async () => {
    const response = await DeleteTheOffer({ accountId });
    if (response.error) {
      toast.error(response.message);
    }
    if (response.error === false) {
      toast.success(response.message);
    }
  };

  return (
    <button onClick={Delete} className="text-center text-xs bg-orange-200 p-2 rounded border border-orange-400">
      {offer}
    </button>
  );
};

export default DeleteOffer;
