import Menu from "@/components/Menu";
import Link from "next/link";

const Settings = () => {
  return (
    <div className="flex flex-col gap-4 p-8">
      <Menu activeMenu="Settings" />
      <div className="flex justify-center gap-8">
        <Link href="/settings/pairs" className="hover:text-orange-300">
          Pairs
        </Link>
        <Link href="/settings/schedule" className="hover:text-orange-300">
          Schedule
        </Link>
      </div>
    </div>
  );
};

export default Settings;
