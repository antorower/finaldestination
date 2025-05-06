"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const ActionBar = ({ accountId, shadowbanActive, adminCaseOpen, ToggleShadowban, ToggleAdminCase }) => {
  const ToggleShadow = async () => {
    const response = await ToggleShadowban({ accountId });
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success(response.message);
    }
  };

  const ToggleCase = async () => {
    const response = await ToggleAdminCase({ accountId });
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success(response.message);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <button onClick={ToggleShadow} className={`${shadowbanActive ? "text-green-500 font-bold" : "text-gray-500"} text-sm`}>
        Shadowban
      </button>
      <button onClick={ToggleCase} className={`${adminCaseOpen ? "text-green-500 font-bold" : "text-gray-500"} text-sm`}>
        Case
      </button>
    </div>
  );
};

export default ActionBar;
