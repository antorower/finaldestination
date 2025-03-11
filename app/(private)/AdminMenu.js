export const dynamic = "force-dynamic";

import Link from "next/link";

const AdminMenu = ({ userid }) => {
  return (
    <div className="hidden sm:flex items-center px-4 py-2 bg-gray-50 justify-between rounded border border-gray-300 text-gray-600 text-sm">
      <Link href={userid ? `/?mode=updateleader&userid=${userid}` : "/?mode=updateleader"} className="hover:text-blue-500 hover:underline">
        Leader
      </Link>
      <Link href={userid ? `/?mode=updatefamily&userid=${userid}` : "/?mode=updatefamily"} className="hover:text-blue-500 hover:underline">
        Family
      </Link>
      <Link href={userid ? `/?mode=updatebeneficiaries&userid=${userid}` : "/?mode=updatebeneficiaries"} className="hover:text-blue-500 hover:underline">
        Beneficiaries
      </Link>
      <Link href={userid ? `/?mode=updateincome&userid=${userid}` : "/?mode=updateincome"} className="hover:text-blue-500 hover:underline">
        Income
      </Link>
      <Link href={userid ? `/?mode=updateteam&userid=${userid}` : "/?mode=updateteam"} className="hover:text-blue-500 hover:underline">
        Team
      </Link>
    </div>
  );
};

export default AdminMenu;
