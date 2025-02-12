"use client";
import React, { useState, useEffect } from "react";

const MatchMakingButton = ({ MatchMaking }) => {
  const [expanded, setExpanded] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    setPassword("");
  }, [expanded]);

  return (
    <div className="w-full m-auto">
      {!expanded && (
        <button onClick={() => setExpanded(true)} className="px-4 py-4 bg-purple-700 text-3xl font-black rounded">
          Match Making
        </button>
      )}
      {expanded && (
        <div className="flex flex-col gap-2">
          <input type="text" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input" />
          <button
            onClick={() => {
              if (password === "12345") {
                setExpanded(false);
                MatchMaking();
              }
            }}
            className="px-2 py-2 bg-purple-700 text-xl font-black rounded"
          >
            Start
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchMakingButton;
