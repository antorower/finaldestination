"use client";
import React, { useState } from "react";

const Explanation = ({ text, lettersShow, classes }) => {
  const [expanded, setExpanded] = useState(false);

  const truncatedText = text.length > lettersShow ? text.slice(0, lettersShow) + "..." : text;

  return (
    <div className="text-gray-800">
      <span className={`${classes} text-justify`}>{expanded ? text : truncatedText}</span>
      {text.length > lettersShow && (
        <button onClick={() => setExpanded(!expanded)} className="text-blue-400 text-sm hover:underline ml-2 focus:outline-none">
          {expanded ? "Λιγότερα" : "Περισσότερα"}
        </button>
      )}
    </div>
  );
};

export default Explanation;
