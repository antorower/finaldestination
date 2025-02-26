"use client";
import { toast } from "react-toastify";

const ChangeStatus = ({ ChangeAccountStatus, id, status }) => {
  const Change = async () => {
    const response = ChangeAccountStatus({ id, status: !status });
    if (response.error) toast.error(response.message);
  };
  return (
    <button className="text-base" onClick={Change}>
      {status ? "🔵" : "🔴"}
    </button>
  );
};

export default ChangeStatus;
