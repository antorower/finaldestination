import Link from "next/link";

const Menu = () => {
    const role = "admin";

    return (
        <div className="flex text-white border-b border-gray-700">
            <Link href="/profile" className="text-center p-2 text-sm hover:text-orange-400">Profile</Link>
            <Link href="/" className="text-center p-2 text-sm hover:text-orange-400">Traders</Link>
            <Link href="/" className="text-center p-2 text-sm hover:text-orange-400">Accounts</Link>
            <Link href="/" className="text-center p-2 text-sm hover:text-orange-400">Teams</Link>
            <Link href="/" className="text-center p-2 text-sm hover:text-orange-400">Trades</Link>
            <Link href="/" className="text-center p-2 text-sm hover:text-orange-400">Payouts</Link>
            <Link href="/" className="text-center p-2 text-sm hover:text-orange-400">Data</Link>
        </div>
    )
}

export default Menu;