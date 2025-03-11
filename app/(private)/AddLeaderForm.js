"use client";
import { toast } from "react-toastify";

const AddLeaderForm = ({ allUsers, SetLeader, userId }) => {
  const Set = async (leaderId) => {
    const response = await SetLeader({ userId, leaderId });
    if (response.error) toast.error(response.message);
  };
  return (
    <div className="flex flex-wrap p-4 items-center justify-center gap-4">
      {allUsers &&
        allUsers.length > 0 &&
        allUsers.map((user) => {
          return (
            <button onClick={() => Set(user._id)} className="bg-blue-500 px-4 py-2 font-bold rounded text-nowrap text-white" key={`allUsers-leadermode-user-${user._id}`}>
              {user.firstName} {user.lastName}
            </button>
          );
        })}
    </div>
  );
};

export default AddLeaderForm;
