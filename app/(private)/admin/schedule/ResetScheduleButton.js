"use client";
import { toast } from "react-toastify";

const ResetScheduleButton = ({ ResetSchedule }) => {
  const Reset = async () => {
    const response = await ResetSchedule();
    if (response.error) toast.error(response.message);
  };
  return (
    <button onClick={Reset} className="w-full bg-red-500 rounded p-4 text-white font-bold text-center flex justify-between">
      <div>⛔</div> <div className="text-lg">Επαναφορά</div> <div>⛔</div>
    </button>
  );
};

export default ResetScheduleButton;
