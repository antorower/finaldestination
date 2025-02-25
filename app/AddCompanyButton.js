"use client";
import { toast } from "react-toastify";

const AddCompanyButton = ({ ActivateCompany, userId, companyId, name }) => {
  const Activate = async () => {
    const response = await ActivateCompany({ userId, companyId });
    if (response.error) toast.error(response.message);
  };
  return (
    <button className="border border-red-700 bg-red-500 text-white font-bold px-4 py-2 rounded hover:scale-105 transition-transform duration-300" onClick={Activate}>
      {name}
    </button>
  );
};

export default AddCompanyButton;
