export const dynamic = "force-dynamic";

import dbConnect from "@/dbConnect";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import TraderCard from "./TraderCard";
import PageTransition from "@/components/PageTransition";

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

const Traders = async () => {
  const traders = await GetAllUsers();
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
