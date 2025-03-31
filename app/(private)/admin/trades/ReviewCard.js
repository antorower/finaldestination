import CompletedButton from "./CompletedButton";
import dbConnect from "@/dbConnect";
import Trade from "@/models/Trade";
import { revalidatePath } from "next/cache";

const CompleteTrade = async (tradeId) => {
  "use server";
  try {
    await dbConnect();
    const trade = await Trade.findById(tradeId);
    trade.status = "completed";
    await trade.save();
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην CompleteTrade: ", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const ReviewCard = ({ trade }) => {
  return (
    <div className={`border flex flex-col justify-between border-gray-400 p-4 rounded bg-red-50 ${trade.priority === "high" && ""} ${trade.priority === "medium" && ""} ${trade.priority === "low" && ""}`}>
      <div className="text-center text-sm text-gray-600">{convertToGreekTime(trade.openTime)}</div>
      <div className={`grid grid-cols-2`}>
        <Participant participant={trade.firstParticipant} />
        <Participant participant={trade.secondParticipant} />
      </div>
      <div className="text-center text-sm font-bold">{trade.note}</div>
      <CompletedButton CompleteTrade={CompleteTrade} tradeId={trade._id.toString()} />
    </div>
  );
};

export default ReviewCard;

const Participant = ({ participant }) => {
  return (
    <div className={`p-4 flex flex-col gap-2`}>
      <div className="text-center font-bold">
        {participant.user.firstName.slice(0, 8)} {participant.user.lastName.slice(0, 3)}.
      </div>
      <div className={"text-center text-sm"}>{participant.status}</div>
      <div className="text-xs flex gap-4 justify-center text-gray-500">
        <div className="flex flex-col items-center gap-2 justify-center">
          <div>{participant.account.number}</div>
          <div>{participant.account.company.name}</div>
        </div>
        <div className="flex flex-col items-center gap-2 justify-center">
          <div>{participant.account.phase}</div>
          <div>{participant.account.balance}</div>
        </div>
      </div>
      <div className="text-center">{participant.profit || 0}</div>
      <div className="flex flex-col items-center justify-center gap-2 text-sm">
        <div>{participant.trade.pair}</div>
        <div>{participant.trade.lots}</div>
        <div>{participant.trade.position}</div>
        <div>{participant.trade.takeProfit}</div>
        <div>{participant.trade.stopLoss}</div>
      </div>
    </div>
  );
};

const convertToGreekTime = (utcDateString) => {
  const utcDate = new Date(utcDateString);

  // Μετατροπή στη ζώνη ώρας Ελλάδας (Europe/Athens, UTC+2 ή UTC+3)
  const options = {
    timeZone: "Europe/Athens",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  return new Intl.DateTimeFormat("el-GR", options).format(utcDate);
};
