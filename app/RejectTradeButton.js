"use client";
import { toast } from "react-toastify";

const RejectTradeButton = ({ ChangeTradeStatus, tradeId, userId, status }) => {
  const ChangeStatus = async () => {
    const response = await ChangeTradeStatus({ tradeId, userId, status: "canceled" });
    if (response.error) toast.error(response.message);
  };

  return (
    <button onClick={ChangeStatus} className={`${status === "accepted" && "opacity-25"} col-span-3 sm:col-span-3 lg:col-span-2 bg-red-500 flex justify-center items-center text-white font-bold text-base sm:text-xl hover:bg-red-600`}>
      {status === "canceled" ? "❌" : "Reject"}
    </button>
  );
};

export default RejectTradeButton;
