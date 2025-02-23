"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const RegisterForm = ({ RegisterUser }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [bybitEmail, setBybitEmail] = useState("");
  const [bybitUid, setBybitUid] = useState("");

  const Register = async () => {
    if (!firstName || !lastName || !telephone || !bybitEmail || !bybitUid) {
      toast.warn("Συμπλήρωσε όλα τα πεδία");
      return;
    }

    const response = await RegisterUser({ firstName, lastName, telephone, bybitEmail, bybitUid });
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success(response.message);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-[400px]">
      <div className="text-center font-bold text-2xl text-gray-700">Εγγραφή</div>
      <div className="text-gray-400 text-sm text-center">Συμπλήρωσε όλα τα παρακάτω στοιχεία σωστά</div>
      <div className="flex items-center justify-center w-full">
        <div className="flex flex-col w-full max-w-[400px] gap-2">
          <input type="text" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className="input" />
          <input type="text" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className="input" />
          <input type="tel" name="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="Telephone" className="input" />
          <input type="email" name="bybitEmail" value={bybitEmail} onChange={(e) => setBybitEmail(e.target.value)} placeholder="Bybit Email" className="input" />
          <input type="text" name="bybitUid" value={bybitUid} onChange={(e) => setBybitUid(e.target.value)} placeholder="Bybit Uid" className="input" />
          <motion.button whileHover={{ scale: 1.03 }} onClick={Register} className="bg-blue-600 rounded p-3 rounded-b hover:bg-blue-700 text-white font-semibold outline-none text-xl">
            ✔
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
