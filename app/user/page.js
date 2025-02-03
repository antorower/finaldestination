import User from "@/models/User";
import dbConnect from "@/dbConnect";
import Menu from "@/components/Menu";
import { auth } from "@clerk/nextjs/server";
import AddAccountLink from "@/components/AddAccountLink";
import Link from "next/link";
import { redirect } from "next/navigation";

const GetUser = async (id) => {
  "use server";
  try {
    await dbConnect();
    return await User.findById(id)
      .populate({
        path: "accounts", // Populate το πεδίο "accounts"
        populate: {
          path: "company", // Nested populate το πεδίο "company" από το "accounts"
        },
      })
      .populate("team") // Populate το πεδίο "team" απευθείας
      .populate({
        path: "beneficiaries.user", // Populate το πεδίο "user" μέσα στο beneficiaries array
      });
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

const Trader = async ({ searchParams }) => {
  const params = await searchParams;

  const action = params.action; // add, remove
  const pickedUser = params.pickeduser; // mongo ID of the user
  const placement = params.placement; // beneficiary, team
  const percentage = Number(params.percentage);

  if (action && pickedUser && placement) {
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
          mainUser.beneficiaries.push(pickedUser);
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

  const profileUser = await GetUser(params.user);
  if (!profileUser) return <div>No user found</div>;

  const { sessionClaims } = await auth();
  if (!sessionClaims.metadata.owner && !params.user === user._id.toString()) return <div>You don't have permissions to see this profile</div>;

  const users = await GetAllUsers();

  console.log(profileUser.beneficiaries);

  return (
    <div className="flex flex-col gap-4">
      <Menu activeMenu="Traders" />
      <div className="text-center text-3xl border-b-2 border-white pb-4">
        {profileUser.firstName} {profileUser.lastName}
      </div>
      <div className="m-auto">Last Trade: {profileUser.lastTrade || "No date"}</div>

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

      <div className="border-y border-gray-700 p-4 flex flex-col gap-4">
        <div className="flex justify-center">Ομάδα</div>
        <div className="flex justify-center">
          {profileUser.team &&
            profileUser.team.length > 0 &&
            profileUser.team.map((user) => {
              return (
                <Link href={`/user?user=${profileUser._id.toString()}&action=remove&pickeduser=${user._id.toString()}&placement=team`} key={`omada-uparxontes-${user._id.toString()}`} className="border border-gray-700 mx-2 px-4 py-2">
                  {user.firstName} {user.lastName}
                </Link>
              );
            })}
        </div>
        <hr />
        <div className="flex justify-center flex-wrap">
          {users &&
            users.length > 0 &&
            users
              .filter((user) => !profileUser.team.some((teamMember) => teamMember._id.toString() === user._id.toString())) // Φιλτράρει όσους είναι ήδη στην ομάδα
              .map((user) => {
                return (
                  <Link href={`/user?user=${profileUser._id.toString()}&action=add&pickeduser=${user._id.toString()}&placement=team`} className="border border-gray-700 mx-2 px-4 py-2" key={`omada-oloi-${user._id.toString()}`}>
                    {user.firstName} {user.lastName}
                  </Link>
                );
              })}
        </div>
      </div>

      <div className="border-y border-gray-700 p-4 flex flex-col gap-4">
        <div className="flex justify-center">Δικαιούχοι</div>
        <div className="flex justify-center">
          {profileUser.beneficiaries &&
            profileUser.beneficiaries.length > 0 &&
            profileUser.beneficiaries.map((user) => {
              return (
                <Link href={`/user?user=${profileUser._id.toString()}&action=remove&pickeduser=${user._id.toString()}&placement=beneficiaries`} key={`dikaiouxoi-uparxontes-${user._id.toString()}`} className="border border-gray-700 mx-2 px-4 py-2">
                  {user.firstName} {user.lastName}
                </Link>
              );
            })}
        </div>
        <hr />
        <div className="flex justify-center flex-wrap">
          {users &&
            users.length > 0 &&
            users
              .filter((user) => !profileUser.beneficiaries.some((beneficiaryMember) => beneficiaryMember._id.toString() === user._id.toString())) // Φιλτράρει όσους είναι ήδη στην ομάδα
              .map((user) => {
                return (
                  <Link href={`/user?user=${profileUser._id.toString()}&action=add&pickeduser=${user._id.toString()}&placement=beneficiaries`} className="border border-gray-700 mx-2 px-4 py-2" key={`dikaiouxoi-oloi-${user._id.toString()}`}>
                    {user.firstName} {user.lastName}
                  </Link>
                );
              })}
        </div>
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
