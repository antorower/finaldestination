const TradeItem = ({ account, priority, openDate, openTime }) => {
  return (
    <div className={`grid grid-cols-12 border ${priority === "high" ? "bg-orange-100" : "bg-gray-100"} w-full`}>
      <button className="col-span-3 sm:col-span-3 lg:col-span-2 bg-red-500 flex justify-center items-center text-white font-bold text-base sm:text-xl hover:bg-red-600">Reject</button>
      <div className="col-span-6 sm:col-span-6 lg:col-span-8 flex flex-col p-2">
        <div className="text-center text-lg">{account}</div>
        <div className="text-center font-bold text-2xl">{openTime}</div>
        <div className="text-center text-xs">{openDate}</div>
      </div>
      <button className="col-span-3 sm:col-span-3 lg:col-span-2 bg-green-500 flex justify-center items-center text-white font-bold text-base sm:text-xl hover:bg-green-600">Accept</button>
    </div>
  );
};

export default TradeItem;
