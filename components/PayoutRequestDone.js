"use client";
import { toast } from "react-toastify";

const PayoutRequestDone = ({ number, PayoutReqDone }) => {
  const PayoutDone = async () => {
    const response = await PayoutReqDone(number);
    if (!response) toast.error("Κάτι πήγε στραβά. Κάνε refresh και δοκίμασε ξανά.");
  };
  return (
    <button className="bg-blue-500 p-2 text-lg rounded font-black w-full" onClick={PayoutDone}>
      ↥ Διάβασε πάνω ↥
    </button>
  );
};

export default PayoutRequestDone;
