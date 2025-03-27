"use client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const TradeCheckedButton = ({ TradeChecked, tradeId, userId, accountId }) => {
  const router = useRouter();

  const Checked = async (e) => {
    e.preventDefault();
    const response = await TradeChecked({ tradeId, userId, accountId });
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success(response.message);
      router.push("/?ready=true");
    }
  };

  return (
    <button onClick={(e) => Checked(e)} className="col-span-6 p-2 mt-2 lg:mt-0 lg:col-span-1 flex justify-center items-center bg-green-500 text-white font-bold text-3xl">
      ✔
    </button>
  );
};

export default TradeCheckedButton;
