"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const ActionBar = ({ account, shadowbanActive, adminCaseOpen, Shadowban, RemoveAdminCase }) => {
  const [isShadowban, setIsShadowban] = useState(false);
  const [isAdminCaseOpen, setIsAdminCaseOpen] = useState(false);

  useEffect(() => {
    setIsShadowban(account.shadowbanActive);
    setIsAdminCaseOpen(account.adminCaseOpen);
  }, [shadowbanActive, adminCaseOpen]);

  return (
    <div className="flex justify-between items-center">
      <button className={`${shadowbanActive ? "text-green-500" : "text-gray-500"} text-sm`}>Shadowban</button>
      <button className={`${adminCaseOpen ? "text-green-500" : "text-gray-500"} text-sm`}>Case</button>
    </div>
  );
};

export default ActionBar;
