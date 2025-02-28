"use client";
import { toast } from "react-toastify";

const AcceptTradeButton = ({ ChangeTradeStatus, tradeId, userId, status }) => {
  const ChangeStatus = async () => {
    const response = await ChangeTradeStatus({ tradeId, userId, status: "accepted" });
    if (response.error) toast.error(response.message);
  };

  return (
    <button onClick={ChangeStatus} className={`${status === "canceled" && "opacity-25"} col-span-3 sm:col-span-3 lg:col-span-2 bg-green-500 flex justify-center items-center text-white font-bold text-base sm:text-xl hover:bg-green-600`}>
      {status === "accepted" ? "✔" : "Accept"}
    </button>
  );
};

export default AcceptTradeButton;
