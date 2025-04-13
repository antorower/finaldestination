const TomorrowTradeItem = ({ account, telephone, opponentName, openDate, openTime }) => {
  return (
    <div className="bg-blue-100 flex flex-col gap-2 p-4 rounded">
      <div className="text-center text-gray-800">{account}</div>
      <div className="text-center">{openDate}</div>
      <div className="text-center text-2xl font-bold">{openTime}</div>
      {telephone && (
        <a href={`tel:${telephone}`} className="flex flex-col items-center justify-center gap-2" style={{ color: "blue", textDecoration: "none" }}>
          <div className="flex gap-2 items-center">
            <div>📞</div>
            <div>{telephone}</div>
          </div>
          <div>{opponentName}</div>
        </a>
      )}
    </div>
  );
};

export default TomorrowTradeItem;
