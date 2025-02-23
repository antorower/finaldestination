"use client";
import { toast } from "react-toastify";

const AcceptUser = ({ userId, Accept, Reject }) => {
  const AcceptUser = async () => {
    const response = await Accept({ userId });
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success(response.message);
    }
  };

  const RejectUser = async () => {
    const response = await Reject({ userId });
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success(response.message);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button onClick={AcceptUser} className="bg-green-500 text-center px-4 py-2 rounded">
        ✔
      </button>
      <button onClick={RejectUser} className="bg-red-500 text-center px-4 py-2 rounded">
        ❌
      </button>
    </div>
  );
};

export default AcceptUser;
