import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

const Menu = async ({ activeMenu }) => {
  const { sessionClaims } = await auth();
  const owner = sessionClaims.metadata.owner;
  const leader = sessionClaims.metadata.leader;

  const linkStyle = "text-center px-2 py-3 text-sm rounded";
  const selectedStyle = "text-white bg-blue-800";
  const deselectedStyle = "text-white bg-gray-800";

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 text-white border-b border-gray-700 py-4">
      <Link href="/" className={`${linkStyle} ${activeMenu === "Profile" ? selectedStyle : deselectedStyle}`}>
        Profile
      </Link>
      {owner && (
        <Link href="/admin" className={`${linkStyle} ${activeMenu === "Admin" ? selectedStyle : deselectedStyle}`}>
          Admin
        </Link>
      )}
      {(owner || leader) && (
        <Link href="/users" className={`${linkStyle} ${activeMenu === "Traders" ? selectedStyle : deselectedStyle}`}>
          Traders
        </Link>
      )}
      {(owner || leader) && (
        <Link href="/accounts" className={`${linkStyle} ${activeMenu === "Accounts" ? selectedStyle : deselectedStyle}`}>
          Accounts
        </Link>
      )}
      {(owner || leader) && (
        <Link href="/" className={`${linkStyle} ${activeMenu === "Accounts" ? selectedStyle : deselectedStyle}`}>
          Team
        </Link>
      )}
      {owner && (
        <Link href="/" className={`${linkStyle} ${activeMenu === "Accounts" ? selectedStyle : deselectedStyle}`}>
          Trades
        </Link>
      )}
      {(owner || leader) && (
        <Link href="/" className={`${linkStyle} ${activeMenu === "Accounts" ? selectedStyle : deselectedStyle}`}>
          Payouts
        </Link>
      )}
      {owner && (
        <Link href="/" className={`${linkStyle} ${activeMenu === "Accounts" ? selectedStyle : deselectedStyle}`}>
          Data
        </Link>
      )}
      {owner && (
        <Link href="/companies" className={`${linkStyle} ${activeMenu === "Companies" ? selectedStyle : deselectedStyle}`}>
          Companies
        </Link>
      )}
      {owner && (
        <Link href="/settings" className={`${linkStyle} ${activeMenu === "Settings" ? selectedStyle : deselectedStyle}`}>
          Settings
        </Link>
      )}
      <Link href="/instructions" className={`${linkStyle} ${activeMenu === "Guide" ? selectedStyle : deselectedStyle}`}>
        Guide
      </Link>
    </div>
  );
};

export default Menu;
