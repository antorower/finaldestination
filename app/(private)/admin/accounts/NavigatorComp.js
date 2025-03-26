"use client";
import { useRouter } from "next/navigation";

const Nav = () => {
  const router = useRouter();

  const Checked = async () => {
    router.push("/");
  };

  return (
    <button onClick={Checked} className="col-span-6 p-2 mt-2 lg:mt-0 lg:col-span-1 flex justify-center items-center bg-green-500 text-white font-bold text-3xl">
      ✔
    </button>
  );
};

export default Nav;
