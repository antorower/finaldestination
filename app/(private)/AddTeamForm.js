"use client";
import { toast } from "react-toastify";

const AddTeamForm = ({ AddUserToTeam, userId, traderId, firstName, lastName }) => {
  const Add = async () => {
    const response = await AddUserToTeam({ userId, traderId });
    if (response.error) toast.error(response.message);
  };

  return (
    <button onClick={Add} className="bg-blue-500 px-4 py-2 font-bold rounded text-nowrap text-white">
      {firstName} {lastName}
    </button>
  );
};

export default AddTeamForm;
