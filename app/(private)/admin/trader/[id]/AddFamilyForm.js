"use client";
import { toast } from "react-toastify";

const AddFamilyForm = ({ allUsers, SetFamily, userId }) => {
  const Set = async (familyId) => {
    const response = await SetFamily({ userId, familyId });
    if (response.error) toast.error(response.message);
  };
  return (
    <div>
      <div className="flex flex-wrap p-4 items-center gap-4">
        {allUsers &&
          allUsers.length > 0 &&
          allUsers.map((user) => {
            return (
              <button onClick={() => Set(user._id)} className="bg-blue-500 px-4 py-2 font-bold rounded text-nowrap text-white" key={`allUsers-familymode-user-${user._id}`}>
                {user.firstName} {user.lastName}
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default AddFamilyForm;
