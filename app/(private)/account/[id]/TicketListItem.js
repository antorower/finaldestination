"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

const TicketListItem = ({ subject, message, notifyUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <>
      <button onClick={() => setIsExpanded(!isExpanded)} className="flex gap-2 border border-gray-300 p-2 rounded text-sm bg-blue-50 relative">
        {notifyUser && <div className="absolute top-2 right-2">💬</div>}
        <div className="text-nowrap text-gray-600 font-semibold">{subject.slice(0, 15)}: </div>
        <div className="text-nowrap text-gray-500">{message.slice(0, 25)}...</div>
      </button>
      {isExpanded && (
        <div className="flex flex-col">
          <div className="text-sm text-gray-600 font-semibold p-1">{subject}</div>
          <div className="text-sm p-1 text-gray-600">{message}</div>
        </div>
      )}
    </>
  );
};

export default TicketListItem;
