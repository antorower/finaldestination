export const dynamic = "force-dynamic";

import dbConnect from "@/dbConnect";
import User from "@/models/User";
import TraderCard from "./TraderCard";
import PageTransition from "@/components/PageTransition";
import { auth } from "@clerk/nextjs/server";

const GetAllUsers = async () => {
  "use server";
  try {
    await dbConnect();
    return await User.find().select("firstName lastName telephone bybitEmail bybitUid status accounts tradingHours adminNote userNote profits dept");
  } catch (error) {
    console.log("Υπήρξε error στην GetAllUsers στο /admin/traders", error);
    return false;
  }
};

const GetUserTeamUsers = async (userId) => {
  "use server";
  try {
    await dbConnect();

    // Βρίσκουμε τον χρήστη που κάνει το request
    const user = await User.findById(userId).select("team");
    if (!user || !user.team || user.team.length === 0) {
      return [];
    }

    // Βρίσκουμε τους χρήστες που είναι μέσα στο team του
    return await User.find({ _id: { $in: user.team } }).select("firstName lastName telephone bybitEmail bybitUid status accounts tradingHours adminNote userNote profits dept");
  } catch (error) {
    console.log("Υπήρξε error στην GetUserTeamUsers στο /admin/traders", error);
    return false;
  }
};

const Traders = async () => {
  const { sessionClaims } = await auth();
  const { isOwner, mongoId } = sessionClaims.metadata;

  const traders = isOwner ? await GetAllUsers() : await GetUserTeamUsers(mongoId);

  if (!traders || traders.length === 0) return <div className="text-center text-gray-500 animate-pulse">Δεν υπάρχουν users</div>;

  return (
    <PageTransition>
      {traders && traders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {traders.map((trader) => {
            return <TraderCard trader={trader} key={`user-trader-${trader._id.toString()}`} />;
          })}
        </div>
      )}
      {(!traders || traders.length === 0) && <div className="text-center animate-pulse text-gray-600">Δεν υπάρχουν users</div>}
    </PageTransition>
  );
};

export default Traders;
