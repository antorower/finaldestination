import User from "@/models/User";
import dbConnect from "@/dbConnect";
import Menu from "@/components/Menu";
import { auth } from "@clerk/nextjs/server";
import AddAccountLink from "@/components/AddAccountLink";
import Link from "next/link";
import { redirect } from "next/navigation";
import UserPaymentMethod from "@/components/UserPaymentMethod";
import { revalidatePath } from "next/cache";

const GetUser = async (id) => {
  "use server";
  try {
    await dbConnect();
    const user = await User.findById(id)
      .populate({
        path: "accounts", // Populate το πεδίο "accounts"
        populate: {
          path: "company", // Nested populate το πεδίο "company" από το "accounts"
        },
      })
      .populate("team") // Populate το πεδίο "team" απευθείας
      .populate("beneficiaries.user");

    return user;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const GetAllUsers = async () => {
  "use server";
  try {
    await dbConnect();
    return await User.find();
  } catch (error) {
    console.log(error);
    return false;
  }
};

const SetPaymentMode = async ({ userId, mode, amount }) => {
  "use server";
  try {
    dbConnect();
    const user = await User.findById(userId);
    if (!user) return false;
    user.payment.mode = mode;
    user.payment.amount = amount;
    await user.save();
    return true;
  } catch (error) {
    console.log(error);
  } finally {
    revalidatePath("/", "layout");
  }
};

const Trader = async ({ searchParams }) => {
  const params = await searchParams;

  const action = params.action; // add, remove
  const pickedUser = params.pickeduser; // mongo ID of the user
  const placement = params.placement; // beneficiary, team

  const profileUser = await GetUser(params.user);
  if (!profileUser) return <div>No user found</div>;

  const { sessionClaims } = await auth();

  const owner = sessionClaims.metadata.owner;
  const trader = !params.user === sessionClaims.metadata.mongoId;
  let leader = false;
  if (!owner && !trader) {
    const exists = profileUser.team.some((user) => user._id.toString() === sessionClaims.metadata.mongoId);
    if (exists) leader = true;
  }

  if (!owner && !trader && !leader) return <div className="m-auto"> You don't have the permissions to see this profile </div>;

  if (action && pickedUser && placement && owner) {
    if (placement === "team") {
      if (action === "add") {
        try {
          dbConnect();
          const mainUser = await User.findById(params.user);
          mainUser.team.push(pickedUser);
          await mainUser.save();
        } catch (error) {
          console.log(error);
        }
        redirect(`/user?user=${params.user}`);
      }
      if (action === "remove") {
        try {
          dbConnect();
          const mainUser = await User.findById(params.user);
          mainUser.team.pull(pickedUser);
          await mainUser.save();
        } catch (error) {
          console.log(error);
        }
        redirect(`/user?user=${params.user}`);
      }
    }
    if (placement === "beneficiaries") {
      if (action === "add") {
        try {
          dbConnect();
          const mainUser = await User.findById(params.user);
          mainUser.beneficiaries.push({ user: pickedUser });
          await mainUser.save();
        } catch (error) {
          console.log(error);
        }
        redirect(`/user?user=${params.user}`);
      }
      if (action === "remove") {
        try {
          dbConnect();
          const mainUser = await User.findById(params.user);
          mainUser.beneficiaries.pull(pickedUser);
          await mainUser.save();
        } catch (error) {
          console.log(error);
        }
        redirect(`/user?user=${params.user}`);
      }
    }
  }

  const users = await GetAllUsers();

  return (
    <div className="flex flex-col gap-4">
      <Menu activeMenu="Traders" />
      <div className="text-center text-xl border-b border-gray-700 pb-4">
        {profileUser.firstName} {profileUser.lastName}
      </div>
      <div className="m-auto text-xl">Last Trade: {profileUser.lastTrade || "No date"}</div>

      <UserPaymentMethod userId={profileUser._id.toString()} SetPaymentMode={SetPaymentMode} />

      <div className="grid grid-cols-12 gap-8 px-8">
        {profileUser.accounts &&
          profileUser.accounts.map((account) => {
            return (
              <div key={account._id.toString()} className="mt-4 grid col-span-12 md:col-span-6 lg:col-span-4">
                <div>{account.company.name}</div>
              </div>
            );
          })}
      </div>

      <div className="p-8 flex flex-col gap-4 text-sm m-auto">
        {(owner || leader) && (
          <div className="border-2 border-purple-700 p-4 flex flex-col gap-4 rounded max-w-[450px]">
            <div className="flex justify-center text-gray-600">Ομάδα</div>
            <div className="flex justify-center border border-green-700 p-4 gap-4">
              {profileUser.team &&
                profileUser.team.length > 0 &&
                profileUser.team.map((user) => {
                  return (
                    <Link href={`/user?user=${profileUser._id.toString()}&action=remove&pickeduser=${user._id.toString()}&placement=team`} key={`omada-uparxontes-${user._id.toString()}`} className="border border-green-700 text-green-500 mx-2 px-4 py-2">
                      {user.firstName} {user.lastName}
                    </Link>
                  );
                })}
            </div>
            {owner && (
              <div className="flex justify-center flex-wrap  border border-orange-700 p-4 text-orange-500 gap-4">
                {users &&
                  users.length > 0 &&
                  users
                    .filter((user) => !profileUser.team.some((teamMember) => teamMember._id.toString() === user._id.toString())) // Φιλτράρει όσους είναι ήδη στην ομάδα
                    .map((user) => {
                      return (
                        <Link href={`/user?user=${profileUser._id.toString()}&action=add&pickeduser=${user._id.toString()}&placement=team`} className="border border-orange-700 mx-2 px-4 py-2" key={`omada-oloi-${user._id.toString()}`}>
                          {user.firstName} {user.lastName}
                        </Link>
                      );
                    })}
              </div>
            )}
          </div>
        )}
        {(owner || leader) && (
          <div className="border border-purple-700 p-4 flex flex-col gap-4 rounded max-w-[450px]">
            <div className="flex justify-center text-gray-600">Δικαιούχοι</div>
            <div className="flex justify-center border border-green-700 p-4 gap-4">
              {profileUser.beneficiaries &&
                profileUser.beneficiaries.length > 0 &&
                profileUser.beneficiaries.map((user) => {
                  return (
                    <Link href={`/user?user=${profileUser._id.toString()}&action=remove&pickeduser=${user._id.toString()}&placement=beneficiaries`} key={`dikaiouxoi-uparxontes-${user._id.toString()}`} className="border border-green-700 text-green-500 mx-2 px-4 py-2">
                      {user.user.firstName} {user.user.lastName} - {user.percentage}%
                    </Link>
                  );
                })}
            </div>
            {owner && (
              <div className="flex justify-center flex-wrap border border-orange-700 p-4 text-orange-500 gap-4">
                {users &&
                  users.length > 0 &&
                  users
                    .filter((user) => !profileUser.beneficiaries.some((beneficiaryMember) => beneficiaryMember._id.toString() === user._id.toString())) // Φιλτράρει όσους είναι ήδη στην ομάδα
                    .map((user) => {
                      return (
                        <Link href={`/user?user=${profileUser._id.toString()}&action=add&pickeduser=${user._id.toString()}&placement=beneficiaries`} className="border border-orange-700 mx-2 px-4 py-2" key={`dikaiouxoi-oloi-${user._id.toString()}`}>
                          {user.firstName} {user.lastName}
                        </Link>
                      );
                    })}
              </div>
            )}
          </div>
        )}
      </div>

      {sessionClaims?.metadata?.owner && (
        <div className="fixed right-8 bottom-8">
          <AddAccountLink userId={profileUser._id.toString()} />
        </div>
      )}
    </div>
  );
};

export default Trader;
