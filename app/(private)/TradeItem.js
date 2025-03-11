import AcceptTradeButton from "./AcceptTradeButton";
import RejectTradeButton from "./RejectTradeButton";

const TradeItem = ({ ChangeTradeStatus, tradeId, userId, account, priority, openDate, openTime, status }) => {
  return (
    <div className={`grid grid-cols-12 border ${priority === "high" ? "bg-orange-100" : "bg-gray-100"} w-full`}>
      <RejectTradeButton ChangeTradeStatus={ChangeTradeStatus} tradeId={tradeId} priority={priority} userId={userId} status={status} />
      <div className={`col-span-6 text-gray-700 sm:col-span-6 lg:col-span-8 flex flex-col p-2 ${status === "canceled" && "opacity-25"}`}>
        <div className="text-center text-lg">{account}</div>
        <div className="text-center font-bold text-2xl">{openTime}</div>
        <div className="text-center text-xs">{openDate}</div>
      </div>
      <AcceptTradeButton ChangeTradeStatus={ChangeTradeStatus} priority={priority} tradeId={tradeId} userId={userId} status={status} />
    </div>
  );
};

export default TradeItem;
