import Link from "next/link";

const Menu = ({ activeMenu }) => {
  const role = "admin";

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 text-white border-b border-gray-700 py-4">
      <Link href="/" className={`text-center p-2 text-sm hover:text-orange-200 ${activeMenu === "Profile" && "text-orange-400"}`}>
        Profile
      </Link>
      <Link href="/users" className={`text-center p-2 text-sm hover:text-orange-200 ${activeMenu === "Traders" && "text-orange-400"}`}>
        Traders
      </Link>
      <Link href="/" className="text-center p-2 text-sm hover:text-orange-200">
        Accounts
      </Link>
      <Link href="/" className="text-center p-2 text-sm hover:text-orange-200">
        Teams
      </Link>
      <Link href="/" className="text-center p-2 text-sm hover:text-orange-200">
        Trades
      </Link>
      <Link href="/" className="text-center p-2 text-sm hover:text-orange-200">
        Payouts
      </Link>
      <Link href="/" className="text-center p-2 text-sm hover:text-orange-200">
        Data
      </Link>
      <Link href="/companies" className={`text-center p-2 text-sm hover:text-orange-200 ${activeMenu === "Companies" && "text-orange-400"}`}>
        Companies
      </Link>
      <Link href="/settings" className={`text-center p-2 text-sm hover:text-orange-200 ${activeMenu === "Settings" && "text-orange-400"}`}>
        Settings
      </Link>
    </div>
  );
};

export default Menu;
