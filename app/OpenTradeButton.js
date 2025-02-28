"use client";
import { toast } from "react-toastify";

const OpenTradeButton = ({ ChangeTradeStatus, tradeId, userId, accountId }) => {
  const ChangeStatus = async () => {
    const response = await ChangeTradeStatus({ tradeId, userId, accountId });
    if (response.error) toast.error(response.message);
  };

  return (
    <button onClick={ChangeStatus} className={"col-span-3 sm:col-span-3 lg:col-span-2 bg-green-500 flex justify-center items-center text-white font-bold text-base sm:text-xl hover:bg-green-600"}>
      Open Trade
    </button>
  );
};

export default OpenTradeButton;
