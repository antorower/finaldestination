"use client";
import { toast } from "react-toastify";

const RemoveTeamForm = ({ RemoveUserFromTeam, userId, traderId, firstName, lastName }) => {
  const Remove = async () => {
    const response = await RemoveUserFromTeam({ userId, traderId });
    if (response.error) toast.error(response.message);
  };

  return (
    <button onClick={Remove} className="bg-blue-500 px-4 py-2 font-bold rounded text-nowrap text-white">
      {firstName} {lastName}
    </button>
  );
};

export default RemoveTeamForm;
