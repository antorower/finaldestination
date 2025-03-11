import TraderCard from "./TraderCard";
import PageTransition from "@/components/PageTransition";
import { auth } from "@clerk/nextjs/server";
import User from "@/models/User";
import dbConnect from "@/dbConnect";

const GetUserAndTeam = async (userId) => {
  "use server";
  try {
    await dbConnect();
    return await User.findById(userId).populate("team");
  } catch (error) {
    console.log("Υπήρξε error στην GetUserAndTeam στο /team", error);
    return false;
  }
};

const Traders = async ({ searchParams }) => {
  const { sessionClaims } = await auth();
  const user = await GetUserAndTeam(sessionClaims.metadata.mongoId);
  return (
    <PageTransition>
      <div className="flex flex-wrap gap-4 justify-center">
        {user.team.map((teamMember) => {
          return <TraderCard key={`trader-team-${teamMember._id.toString()}`} trader={teamMember} />;
        })}
      </div>
    </PageTransition>
  );
};

export default Traders;
