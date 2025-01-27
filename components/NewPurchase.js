"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const NewPurchase = ({ company, capital, link, id, SaveNewAccount }) => {
  const [number, setNumber] = useState("");
  const router = useRouter();

  const SaveAccount = async () => {
    if (!number) {
      toast.warn("Συμπλήρωσε το νούμερο του account");
      return;
    }

    const response = await SaveNewAccount({ number, id });
    if (response) {
      toast.success("Ο αριθμός του νέου account δηλώθηκε");
      router.refresh();
    } else {
      toast.warn("Κάτι πήγε στραβά, κάνε refresh και προσπάθησε ξανά");
    }
  };

  return (
    <div className="border border-gray-700 p-4 flex flex-col gap-4 rounded">
      <div className="flex justify-between items-center">
        <div>{company}</div>
        <a href={link} target="_blank">
          <Image src="/link.svg" alt="" width={16} height={16} />
        </a>
      </div>
      <div>{`$${capital.toLocaleString("en-US")}`}</div>
      <div className="text-sm text-gray-500">
        Αφού αγοράσεις ένα account των ${capital.toLocaleString("en-US")} από {company} γράψε τον αριθμό του ακριβώς από κάτω και πάτα το κουμπί Αποθήκευση
      </div>
      <input type="text" required value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Account Number" className="input" />
      <button className="bg-blue-500 p-4 rounded font-black w-full" onClick={SaveAccount}>
        Αποθήκευση
      </button>
    </div>
  );
};

export default NewPurchase;
