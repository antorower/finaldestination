import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

const Menu = async ({ activeMenu }) => {
  const { sessionClaims } = await auth();
  const owner = sessionClaims.metadata.owner;
  const leader = sessionClaims.metadata.leader;

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 text-white border-b border-gray-700 py-4">
      <Link href="/" className={`text-center p-2 text-sm hover:text-orange-200 ${activeMenu === "Profile" && "text-orange-400"}`}>
        Profile
      </Link>
      {owner && (
        <Link href="/admin" className={`text-center p-2 text-sm hover:text-orange-200 ${activeMenu === "Admin" && "text-orange-400"}`}>
          Admin
        </Link>
      )}
      {(owner || leader) && (
        <Link href="/users" className={`text-center p-2 text-sm hover:text-orange-200 ${activeMenu === "Traders" && "text-orange-400"}`}>
          Traders
        </Link>
      )}
      {(owner || leader) && (
        <Link href="/accounts" className={`text-center p-2 text-sm hover:text-orange-200 ${activeMenu === "Accounts" && "text-orange-400"}`}>
          Accounts
        </Link>
      )}
      {(owner || leader) && (
        <Link href="/" className="text-center p-2 text-sm hover:text-orange-200">
          Team
        </Link>
      )}
      {owner && (
        <Link href="/" className="text-center p-2 text-sm hover:text-orange-200">
          Trades
        </Link>
      )}
      {(owner || leader) && (
        <Link href="/" className="text-center p-2 text-sm hover:text-orange-200">
          Payouts
        </Link>
      )}
      {owner && (
        <Link href="/" className="text-center p-2 text-sm hover:text-orange-200">
          Data
        </Link>
      )}
      {owner && (
        <Link href="/companies" className={`text-center p-2 text-sm hover:text-orange-200 ${activeMenu === "Companies" && "text-orange-400"}`}>
          Companies
        </Link>
      )}
      {owner && (
        <Link href="/settings" className={`text-center p-2 text-sm hover:text-orange-200 ${activeMenu === "Settings" && "text-orange-400"}`}>
          Settings
        </Link>
      )}
      <Link href="/instructions" className={`text-center p-2 text-sm hover:text-orange-200 ${activeMenu === "Guide" && "text-orange-400"}`}>
        Guide
      </Link>
    </div>
  );
};

export default Menu;
