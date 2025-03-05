import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

const UserPending = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr] h-dvh bg-gray-50">
      <div className="relative w-full h-full hidden md:block">
        <Image src="/business-man.jpg" alt="" fill style={{ objectFit: "cover", objectPosition: "center top" }} quality={50} priority />
      </div>
      <div className="p-4 overflow-y-auto flex flex-col w-full items-center justify-center">
        <UserButton />
        <div className="text-lg text-gray-800 animate-pulse">Η εγγραφή σου έγινε επιτυχώς</div>
        <div className="text-sm text-gray-500 animate-pulse">Περίμενε έγκριση από τους διαχειριστές</div>
      </div>
    </div>
  );
};

export default UserPending;
