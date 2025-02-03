import User from "@/models/User";
import dbConnect from "@/dbConnect";
import Menu from "@/components/Menu";
import Link from "next/link";

const GetAllUsers = async (sortField) => {
  "use server";
  try {
    await dbConnect();

    // Ορισμός προεπιλεγμένου πεδίου ταξινόμησης (π.χ., "profits")
    const sortBy = sortField || "profits";

    // Εύρεση χρηστών με ταξινόμηση
    return await User.find()
      .populate("accounts")
      .sort({ [sortBy]: -1 }); // -1 για φθίνουσα σειρά, 1 για αύξουσα
  } catch (error) {
    console.log(error);
    return false;
  }
};

const Users = async ({ searchParams }) => {
  // Ανάγνωση της παραμέτρου "sort" από το searchParams
  const params = await searchParams;
  const sortField = params.sort || "profits"; // Default "profits" αν δεν υπάρχει sort
  const users = await GetAllUsers(sortField);

  return (
    <div className="flex flex-col gap-4 p-8">
      <Menu activeMenu="Traders" />
      <div className="border border-gray-700 p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
        <Link href="/users?sort=lastTradeOpened">Last Trade</Link>
        <Link href="/users?sort=profits">Profits</Link>
        <Link href="/users?sort=note">Note</Link>
        <Link href="/users?sort=accounts">Accounts</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
        {users &&
          users.length > 0 &&
          users.map((user) => {
            return (
              <div key={`user-${user.clerkId}`} className={`border ${user.accepted ? "border-gray-700" : "border-red-500"} p-4 flex flex-col gap-2`}>
                <Link className="text-xl text-orange-500" href={`/user?user=${user._id}`}>
                  {`${(user.firstName + " " + user.lastName).length > 25 ? (user.firstName + " " + user.lastName).slice(0, 22) + "..." : user.firstName + " " + user.lastName}`}
                </Link>
                <div>Total Profits: ${user.profits}</div>
                <div>Last Trade: {user.lastTradeOpened || "N/A"}</div>
                <div>{user.bybitEmail.length > 35 ? user.bybitEmail.slice(0, 32) + "..." : user.bybitEmail}</div>
                <div>{user.note || "No notes"}</div>
                <div>Number of accounts: {user.accounts.length}</div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Users;
