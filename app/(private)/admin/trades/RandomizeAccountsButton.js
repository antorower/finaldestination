"use client";
import { toast } from "react-toastify";

const RandomizeAccounts = ({ Randomize }) => {
  const Rand = async () => {
    const response = Randomize();
    if (response) toast.success("OK");
    if (!response) toast.error("NOT OKKKK");
  };
  return <button onClick={Rand}>content</button>;
};

export default RandomizeAccounts;
