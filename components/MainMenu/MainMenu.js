import LeftBar from "./LeftBar";
import dbConnect from "@/dbConnect";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";

const GetUser = async () => {
  "use server";
  try {
    await dbConnect();
    const { sessionClaims } = await auth();
    return await User.findOne({ clerkId: sessionClaims.userId }).select("status profits isOwner isAdmin isLeader");
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default async function MainMenu() {
  const user = await GetUser();
  return <LeftBar isOwner={user.isOwner} isAdmin={user.isAdmin} isLeader={user.isLeader} active={user.status === "active"} />;
}
//await new Promise((resolve) => setTimeout(resolve, 5000));
