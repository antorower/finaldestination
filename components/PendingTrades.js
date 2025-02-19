import TradeButtonAcceptReject from "./TradeButtonAcceptReject";
import Trade from "@/models/Trade";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import dbConnect from "@/dbConnect";

export const SubmitTrade = async ({ userId, tradeId, account, action, points }) => {
  "use server";
  // ----> Απορρίπτει ή αποδέχεται το trade
  const tradesSuggestionHours = {
    starting: 3,
    ending: 9,
  };

  const now = new Date();
  const greeceTime = 8 || Number(now.toLocaleString("en-US", { timeZone: "Europe/Athens", hour: "2-digit", hour12: false })); // EDIT
  if (greeceTime < tradesSuggestionHours.starting || greeceTime > tradesSuggestionHours.ending) return false;

  try {
    await dbConnect();
    const trade = await Trade.findById(tradeId);
    if (!trade) return false;

    if (trade.firstParticipant.user._id.toString() === userId) {
      if (action === "accept") {
        trade.firstParticipant.status = "accepted";
      } else if (action === "reject") {
        trade.firstParticipant.status = "canceled";
      }
    }
    if (trade.secondParticipant.user._id.toString() === userId) {
      if (action === "accept") {
        trade.secondParticipant.status = "accepted";
      } else if (action === "reject") {
        trade.secondParticipant.status = "canceled";
      }
    }
    await trade.save();

    if (points < 0) {
      const user = await User.findById(userId);
      const title = "Trade Rejected";
      const description = `Ο/Η ${user.firstName} ${user.lastName} έχασε ${Math.abs(points)} points επειδή έκανε reject ένα high priority trade στο ${account}`;
      await user.addPoints({ title, description, points });
    }
    if (points > 0) {
      const user = await User.findById(userId);
      const title = "Trade Accepted";
      const description = `Ο/Η ${user.firstName} ${user.lastName} κέρδισε ${Math.abs(points)} points επειδή έκανε accept ένα low priority trade στο ${account}`;
      await user.addPoints({ title, description, points });
    }

    return true;
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const PendingTrades = ({ trades, user }) => {
  return (
    <div className="flex flex-wrap justify-center gap-8">
      {trades &&
        trades.length > 0 &&
        trades.map((trade) => {
          let account;
          let status;
          let priority;
          const day = trade.openTime.dayString;
          const date = trade.openTime.day + "/" + trade.openTime.month;
          const hour = trade.openTime.hour + ":" + (trade.openTime.minutes < 10 ? `0${trade.openTime.minutes}` : trade.openTime.minutes);

          if (trade.firstParticipant.user._id.toString() === user._id.toString()) {
            account = trade.firstParticipant.account.number;
            status = trade.firstParticipant.status;
            priority = trade.firstParticipant.priority;
          }
          if (trade.secondParticipant.user._id.toString() === user._id.toString()) {
            account = trade.secondParticipant.account.number;
            status = trade.secondParticipant.status;
            priority = trade.secondParticipant.priority;
          }

          if (status !== "pending") return null;

          return (
            <div key={`trade-${trade._id.toString()}`} className={`flex flex-col justify-center items-center rounded gap-2 px-4 py-4 ${priority === "high" ? "border-2 border-blue-500 bg-blue-800" : "border-2 border-gray-500 bg-gray-800"}`}>
              <div className="text-center rounded flex gap-2 text-2xl font-bold">
                <div>{date}</div>
                <div>{day}</div>
                <div>{hour}</div>
              </div>
              <div className="text-lg flex items-center">στο {account}</div>
              <div className="flex gap-4 w-full">
                <TradeButtonAcceptReject text="Αποδοχή" account={account} accept={true} trader={user._id.toString()} trade={trade._id.toString()} SubmitTrade={SubmitTrade} points={priority === "high" ? 0 : 1} />
                <TradeButtonAcceptReject text="Απόρριψη" account={account} accept={false} trader={user._id.toString()} trade={trade._id.toString()} SubmitTrade={SubmitTrade} points={priority === "high" ? -4 : 0} />
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default PendingTrades;
