"use client";
import { toast } from "react-toastify";

const UserIsHereButton = ({ tradeId, userId, Confirmation }) => {
  const Confirm = async () => {
    const response = await Confirmation({ tradeId, userId });
    if (response) {
      toast.success("Επιβεβαίωσες ότι θα βάλεις το trade");
    } else {
      toast.error("Κάτι πήγε στραβά");
    }
  };

  return (
    <button onClick={Confirm} className="bg-blue-700 px-4 py-2 rounded border border-blue-300">
      Είμαι εδώ
    </button>
  );
};

export default UserIsHereButton;
