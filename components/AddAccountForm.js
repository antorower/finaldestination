"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

const AddAccountForm = ({ companies, AddNewAccount }) => {
  const [company, setCompany] = useState("");
  const [capital, setCapital] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const user = searchParams.get("user");

  const AddAccount = async () => {
    const newAccount = {
      user: user,
      company: company,
      capital: capital,
      phase: 1,
      balance: capital,
      activities: [{ title: "Το account προσετέθη", description: "Το account προστέθηκε στον λογαριασμό του χρήστη προς αγορά" }],
      status: "WaitingPurchase",
      note: "Νέα αγορά account",
    };
    const response = await AddNewAccount(newAccount);
    if (!response) {
      toast.error("Something went wrong");
    }
    if (response) {
      toast.success("Account successfully added");
      router.push(`/user?user=${user}`);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-8 m-auto">
        {companies &&
          companies.length > 0 &&
          companies.map((comp) => {
            return (
              <button className={`${company === comp._id ? "text-orange-500" : "text-white"}`} onClick={() => setCompany(comp._id)} key={`company-${comp._id}`}>
                {comp.name}
              </button>
            );
          })}
      </div>
      <div className="flex gap-8 m-auto">
        <button className={`${capital === 50000 ? "text-orange-500" : "text-white"}`} onClick={() => setCapital(50000)}>
          $50.000
        </button>
        <button className={`${capital === 60000 ? "text-orange-500" : "text-white"}`} onClick={() => setCapital(60000)}>
          $60.000
        </button>
        <button className={`${capital === 100000 ? "text-orange-500" : "text-white"}`} onClick={() => setCapital(100000)}>
          $100.000
        </button>
        <button className={`${capital === 200000 ? "text-orange-500" : "text-white"}`} onClick={() => setCapital(200000)}>
          $200.000
        </button>
      </div>
      {company && capital && (
        <button onClick={AddAccount} className="m-auto bg-orange-500 rounded px-4 py-2 hover:bg-orange-600">
          Add Account
        </button>
      )}
    </div>
  );
};

export default AddAccountForm;
