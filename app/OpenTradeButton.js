"use client";
import { toast } from "react-toastify";

const OpenTradeButton = ({ OpenTrade, tradeId, userId, accountId }) => {
  const Open = async () => {
    const response = await OpenTrade({ tradeId, userId, accountId });
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success(response.message);
    }
  };

  return (
    <button onClick={Open} className={"col-span-3 sm:col-span-3 lg:col-span-2 bg-green-500 flex justify-center items-center text-white font-bold text-base sm:text-xl hover:bg-green-600"}>
      Open Trade
    </button>
  );
};

export default OpenTradeButton;
