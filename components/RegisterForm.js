"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const RegisterForm = ({ RegisterUser }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [bybitEmail, setBybitEmail] = useState("");
  const [bybitUid, setBybitUid] = useState("");

  const router = useRouter();

  const Register = async () => {
    if (!firstName || !lastName || !telephone || !bybitEmail || !bybitUid) {
      toast.warn("Συμπλήρωσε όλα τα πεδία");
      return false;
    }

    try {
      const response = await RegisterUser({
        firstName,
        lastName,
        telephone,
        bybitEmail,
        bybitUid,
      });
      if (response) {
        toast.success("Επιτυχής εγγραφή");
        router.refresh();
      } else {
        toast.error("Κάτι πήγε στραβά συνάδελφε, επικοινώνησε με τον Αντώνη");
      }
    } catch (error) {
      toast.error("Κάτι πήγε στραβά, επικοινώνησε με τον Αντώνη");
      console.error("Error: ", error);
    }
  };

  return (
    <div className="flex w-full h-dvh items-center justify-center">
      <div className="flex flex-col w-full max-w-[300px] gap-2">
        <input type="text" required pattern="[A-Za-z]+" title="First name should only contain letters." minLength={3} maxLength={20} name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className="input" />
        <input type="text" required pattern="[A-Za-z]+" title="Last name should only contain letters." minLength={3} maxLength={20} name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className="input" />
        <input type="tel" title="Telephone should only contain numbers and special characters like +, -, (, )." minLength={3} maxLength={20} name="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="Telephone" className="input" />
        <input type="email" minLength={3} maxLength={50} name="bybitEmail" value={bybitEmail} onChange={(e) => setBybitEmail(e.target.value)} placeholder="Bybit Email" className="input" />
        <input type="text" required minLength={3} maxLength={20} name="bybitUid" value={bybitUid} onChange={(e) => setBybitUid(e.target.value)} placeholder="Bybit Uid" className="input" />
        <button onClick={Register} className="bg-orange-700 p-3 rounded-b hover:bg-orange-600 text-white font-semibold outline-none">
          Register
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
