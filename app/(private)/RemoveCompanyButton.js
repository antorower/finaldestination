"use client";
import { toast } from "react-toastify";

const RemoveCompanyButton = ({ DeactivateCompany, userId, companyId, name }) => {
  const Activate = async () => {
    const response = await DeactivateCompany({ userId, companyId });
    if (response.error) toast.error(response.message);
  };
  return (
    <button className="border border-green-600 bg-green-500 text-white font-bold px-4 py-2 rounded hover:scale-105 transition-transform duration-300" onClick={Activate}>
      {name}
    </button>
  );
};

export default RemoveCompanyButton;
