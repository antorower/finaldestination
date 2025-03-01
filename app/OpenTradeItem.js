import AwareButton from "./AwareButton";
import OpenTradeButton from "./OpenTradeButton";

const OpenTradeItem = ({ BeAwareOfTrade, OpenTrade, tradeId, userId, account, accountId, openDate, openTime, status }) => {
  return (
    <div className={`grid grid-cols-12 border ${status === "accepted" ? "bg-gray-100" : "bg-green-100"} w-full`}>
      {status === "accepted" && <AwareButton BeAwareOfTrade={BeAwareOfTrade} tradeId={tradeId} userId={userId} />}
      <div className={`col-span-9 text-gray-700 sm:col-span-9 lg:col-span-10 flex flex-col p-2 ${status === "canceled" && "opacity-25"}`}>
        <div className="text-center text-lg">{account}</div>
        <div className="text-center font-bold text-2xl">{openTime}</div>
        <div className="text-center text-xs">{openDate}</div>
      </div>
      {status === "aware" && <OpenTradeButton OpenTrade={OpenTrade} accountId={accountId} tradeId={tradeId} userId={userId} />}
    </div>
  );
};

export default OpenTradeItem;
