"use client";
import { toast } from "react-toastify";

const ToggleActiveButton = ({ ToggleStatus, id, status }) => {
  const Toogle = async () => {
    const response = ToggleStatus({ id, status: status === "active" ? "inactive" : "active" });
    if (response.error) toast.error(response.message);
  };

  return <button onClick={Toogle}>{status === "active" ? "🔵" : "🔴"}</button>;
};

export default ToggleActiveButton;
