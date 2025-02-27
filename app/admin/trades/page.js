export const dynamic = "force-dynamic";
import PageTransition from "@/components/PageTransition";
import dbConnect from "@/dbConnect";
import Trade from "@/models/Trade";

const GetTrades = async () => {
  "use server";
  try {
    await dbConnect();
    return await Trade.find().populate({ path: "firstParticipant.user" }).populate({ path: "secondParticipant.user" }).populate({ path: "firstParticipant.account" }).populate({ path: "secondParticipant.account" });
  } catch (error) {
    console.log("Υπήρξε error στην GetTrades στο /trades", error);
    return false;
  }
};

const Trades = async () => {
  const trades = await GetTrades();
  return (
    <PageTransition>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center items-center text-white font-bold bg-blue-500 p-2 rounded text-2xl">Trades</div>
        <div className="flex flex-wrap gap-8 border border-gray-500 p-4">
          {trades.map((trade) => {
            return (
              <div key={`trade-${trade._id.toString()}`}>
                {trade.firstParticipant.user.firstName} {trade.secondParticipant.user.lastName}
              </div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
};

export default Trades;
