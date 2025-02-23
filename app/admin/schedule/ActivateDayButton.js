"use client";
import { toast } from "react-toastify";

const ActivateDayButton = ({ day, active, ActivateDay }) => {
  const Activate = async () => {
    const response = await ActivateDay(day);
    if (response.error) {
      toast.error(response.message);
    }
  };
  return <button onClick={Activate}>{active ? "🔴" : "🔵"}</button>;
};

export default ActivateDayButton;
