"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const AddAccountForm = ({ CreateNewAccount, companies, id }) => {
  const [company, setCompany] = useState("");
  const [capital, setCapital] = useState("");
  const router = useRouter();
  const Create = async () => {
    const response = await CreateNewAccount({ id, capital, company });
    if (response.error) {
      toast.error(response.message);
    }
    if (response.error === false) {
      toast.success(response.message);
      router.push(`/admin/trader/${id}`);
    }
  };

  return (
    <div className="border border-gray-300 rounded w-full max-w-[400px] p-4 bg-gray-50">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap justify-center gap-4">
          {companies.map((companyItem) => (
            <CompanyButton name={companyItem.name} id={companyItem._id} company={company} setCompany={setCompany} key={`add-account-company-${companyItem._id}`} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 justify-between text-sm">
          <CapitalButton setCapital={setCapital} capital={5000} activeCapital={capital} />
          <CapitalButton setCapital={setCapital} capital={6000} activeCapital={capital} />
          <CapitalButton setCapital={setCapital} capital={10000} activeCapital={capital} />
          <CapitalButton setCapital={setCapital} capital={15000} activeCapital={capital} />
          <CapitalButton setCapital={setCapital} capital={20000} activeCapital={capital} />
          <CapitalButton setCapital={setCapital} capital={25000} activeCapital={capital} />
          <CapitalButton setCapital={setCapital} capital={50000} activeCapital={capital} />
          <CapitalButton setCapital={setCapital} capital={60000} activeCapital={capital} />
          <CapitalButton setCapital={setCapital} capital={100000} activeCapital={capital} />
          <CapitalButton setCapital={setCapital} capital={200000} activeCapital={capital} />
          <CapitalButton setCapital={setCapital} capital={300000} activeCapital={capital} />
        </div>
        <button onClick={Create} className="bg-blue-500 hover:bg-blue-600 transition-colors duration-300 p-2 w-full text-white text-base rounded">
          ✔
        </button>
      </div>
    </div>
  );
};

export default AddAccountForm;

const CompanyButton = ({ name, id, company, setCompany }) => {
  return (
    <button onClick={() => setCompany(id)} className={`${company === id ? "bg-blue-600" : "bg-blue-400"} px-4 py-2 rounded hover:scale-105 transition-transform duration-300 text-white font-semibold`}>
      {name}
    </button>
  );
};

const CapitalButton = ({ setCapital, capital, activeCapital }) => {
  return (
    <button onClick={() => setCapital(capital)} className={`p-2 ${activeCapital === capital ? "bg-orange-500" : "bg-orange-300 hover:bg-orange-500"} rounded`}>
      {new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      })
        .format(capital)
        .replace(",", ".")}
    </button>
  );
};
