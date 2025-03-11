"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const ShareForm = ({ userShare, userId, SaveShare }) => {
  const [share, setShare] = useState("");

  const Save = async () => {
    const response = await SaveShare({ userId, share });
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success("Το ποσοστό άλλαξε");
    }
  };

  useEffect(() => {
    if (userShare) setShare(userShare);
  }, [userShare]);

  return (
    <div>
      <input value={share} onChange={(e) => setShare(e.target.value)} placeholder="Ποσοστό" className="input rounded" />
      <button onClick={Save} className="bg-blue-500 text-white px-4 py-2 w-full transition-colors duration-300 hover:bg-blue-600 rounded mt-2">
        ✔
      </button>
    </div>
  );
};

export default ShareForm;
