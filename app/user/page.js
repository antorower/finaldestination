import User from "@/models/User";
import dbConnect from "@/dbConnect";
import Menu from "@/components/Menu";
import { auth } from "@clerk/nextjs/server";
import AddAccountLink from "@/components/AddAccountLink";

const GetUser = async (id) => {
  "use server";
  try {
    await dbConnect();
    return await User.findById(id).populate({
      path: "accounts", // Populate το πεδίο "accounts"
      populate: {
        path: "company", // Nested populate το πεδίο "company" από το "accounts"
      },
    });
  } catch (error) {
    console.log(error);
    return false;
  }
};

const Trader = async ({ searchParams }) => {
  const params = await searchParams;
  const user = await GetUser(params.user);
  if (!user) return <div>No user found</div>;

  const { sessionClaims } = await auth();
  if (!sessionClaims.metadata.owner && !params.user === user._id.toString()) return <div>You don't have permissions to see this profile</div>;

  return (
    <div className="flex flex-col gap-4">
      <Menu activeMenu="Traders" />
      <div className="text-center text-3xl border-b-2 border-white pb-4">
        {user.firstName} {user.lastName}
      </div>
      <div className="m-auto">Last Trade: {user.lastTrade || "No date"}</div>

      <div className="grid grid-cols-12 gap-8 px-8">
        {user.accounts &&
          user.accounts.map((account) => {
            return (
              <div key={account._id.toString()} className="mt-4 grid col-span-12 md:col-span-6 lg:col-span-4">
                <div>{account.company.name}</div>
              </div>
            );
          })}
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
