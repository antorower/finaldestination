import User from "@/models/User";
import dbConnect from "@/dbConnect";
import Menu from "@/components/Menu";
import { auth } from "@clerk/nextjs/server";
import AddAccountLink from "@/components/AddAccountLink";

const GetUser = async (id) => {
  "use server";
  try {
    await dbConnect();
    return await User.findById(id).populate("accounts");
  } catch (error) {
    console.log(error);
    return false;
  }
};

const Trader = async ({ searchParams }) => {
  const params = await searchParams;
  const user = await GetUser(params.user);
  if (!user) return <div>No user found</div>;
  console.log(user);

  const { sessionClaims } = await auth();

  return (
    <div className="flex flex-col gap-4">
      <Menu activeMenu="Traders" />
      <div className="text-center text-3xl border-b-2 border-white pb-4">
        {user.firstName} {user.lastName}
      </div>
      <div className="m-auto">Last Trade: {user.lastTrade || "No date"}</div>
      <div className="grid grid-cols-12 gap-8  px-8">
        <div className="border border-gray-700 rounded p-4 col-span-12">
          <div>Live Accounts</div>
          <div className="text-gray-500 text-sm">Αγόρασε τα παρακάτω accounts και δήλωσε τον αριθμό τους</div>
          <div className="mt-4">context</div>
        </div>
        <div className="border border-gray-700 rounded p-4 col-span-12 md:col-span-4">
          <div>Νέες Αγορές</div>
          <div className="text-gray-500 text-sm">Αγόρασε τα παρακάτω accounts και δήλωσε τον αριθμό τους</div>
          <div className="mt-4">
            {user.accounts &&
              user.accounts.map((account) => {
                if (account.status === "WaitingPurchase") {
                  return <div key={`account-${account._id}`}>{account.capital}</div>;
                }
                return;
              })}
          </div>
        </div>
        <div className="border border-gray-700 rounded p-4 col-span-12 md:col-span-4">
          <div>Passed Accounts</div>
          <div className="text-gray-500 text-sm">Έλεγξε αν έχεις συμπληρώσει τις minimum trading days και έχε το νου σου πότε θα είναι έτοιμο το επόμενο account για να το δηλώσεις</div>
          <div className="mt-4">context</div>
        </div>
        <div className="border border-gray-700 rounded p-4 col-span-12 md:col-span-4">
          <div>Payout Accounts</div>
          <div className="text-gray-500 text-sm">Δες την ημερομηνία που πλρώνονται τα accounts σου και δήλωσε την. Μην ξεχνάς να κάνεις τα payout request στην ώρα τους.</div>
          <div className="mt-4">context</div>
        </div>
      </div>
      {sessionClaims?.metadata?.owner && (
        <div className="fixed right-8 bottom-8">
          <AddAccountLink userId={user._id.toString()} />
        </div>
      )}
    </div>
  );
};

export default Trader;
