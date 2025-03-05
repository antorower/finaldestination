"use client";
import { toast } from "react-toastify";

const RemovePair = ({ pairId, pairName, day, RemovePairFromDay }) => {
  const AddPairToDaySchedule = async () => {
    const response = await RemovePairFromDay({ day, pairId });
    if (response.error) toast.error(response.message);
  };
  return (
    <button onClick={AddPairToDaySchedule} className="bg-blue-700 text-white font-semibold px-4 py-2 rounded hover:bg-blue-800">
      {pairName}
    </button>
  );
};

export default RemovePair;
