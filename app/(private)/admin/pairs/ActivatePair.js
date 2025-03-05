"use client";
import { toast } from "react-toastify";

const ActivatePair = ({ pairId, active, ChangeStatus }) => {
  const Change = async () => {
    const response = await ChangeStatus({ pairId, active });
    if (response.error) toast.error(response.message);
  };
  return <button onClick={Change}>{active ? "🔵" : "🔴"}</button>;
};

export default ActivatePair;
