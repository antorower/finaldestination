"use client";
import { toast } from "react-toastify";

const AddPair = ({ pairId, pairName, day, AddPairToDay }) => {
  const AddPairToDaySchedule = async () => {
    const response = await AddPairToDay({ day, pairId });
    if (response.error) toast.error(response.message);
  };
  return (
    <button onClick={AddPairToDaySchedule} className="bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600">
      {pairName}
    </button>
  );
};

export default AddPair;
