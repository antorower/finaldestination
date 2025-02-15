import TradeButtonAcceptReject from "./TradeButtonAcceptReject";

const PendingTrades = ({ trades, user, SubmitTrade }) => {
  return (
    <div className="flex flex-wrap justify-center gap-8 my-8">
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
            <div key={`trade-${trade._id.toString()}`} className={`flex flex-col justify-center items-center rounded gap-2 px-4 py-4 ${priority === "high" ? "border-2 border-blue-500 bg-blue-800" : " border border-gray-500 bg-gray-800"}`}>
              <div className="text-center rounded flex gap-2 text-2xl font-bold">
                <div>{date}</div>
                <div>{day}</div>
                <div>{hour}</div>
              </div>
              <div className="text-lg flex items-center">στο {account}</div>
              <div className="flex gap-4 w-full">
                <TradeButtonAcceptReject text="Accept" account={account} accept={true} trader={user._id.toString()} trade={trade._id.toString()} SubmitTrade={SubmitTrade} points={priority === "high" ? 0 : 1} />
                <TradeButtonAcceptReject text="Reject" account={account} accept={false} trader={user._id.toString()} trade={trade._id.toString()} SubmitTrade={SubmitTrade} points={priority === "high" ? -4 : 0} />
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default PendingTrades;
