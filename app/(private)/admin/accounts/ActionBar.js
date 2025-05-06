"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const ActionBar = ({ account, shadowbanActive, adminCaseOpen, Shadowban, RemoveAdminCase }) => {
  const Shadow = async () => {
    const response = await Shadowban({ accountId });
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success(response.message);
    }
  };

  const Remove = async () => {
    const response = await RemoveAdminCase({ accountId });
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success(response.message);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <button onClick={Shadow} className={`${shadowbanActive ? "text-green-500 font-bold" : "text-gray-500"} text-sm`}>
        Shadowban
      </button>
      <button onClick={Remove} className={`${adminCaseOpen ? "text-green-500 font-bold" : "text-gray-500"} text-sm`}>
        Case
      </button>
    </div>
  );
};

export default ActionBar;
