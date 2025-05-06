"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const DeleteAccount = ({ accountId, DeleteAccountAction }) => {
  const Delete = async () => {
    const response = await DeleteAccountAction({ accountId });
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success(response.success);
    }
  };
  return (
    <button onClick={Delete} className="text-red-500 font-bold">
      Delete
    </button>
  );
};

export default DeleteAccount;
