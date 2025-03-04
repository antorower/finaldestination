const TomorrowTradeItem = ({ account, openDate, openTime }) => {
  return (
    <div className="bg-blue-100 flex flex-col gap-2 p-4 rounded">
      <div className="text-center text-gray-800">{account}</div>
      <div className="text-center">{openDate}</div>
      <div className="text-center text-2xl font-bold">{openTime}</div>
    </div>
  );
};

export default TomorrowTradeItem;
