import LeftBar from "./LeftBar";
import dbConnect from "@/dbConnect";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";

export default async function MainMenu() {
  const { sessionClaims } = await auth();
  const isOwner = sessionClaims.metadata.isOwner;
  const isLeader = sessionClaims.metadata.isLeader;

  return <LeftBar isOwner={isOwner} isLeader={isLeader} />;
}
