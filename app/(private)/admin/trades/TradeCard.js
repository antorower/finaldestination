const TradeCard = ({ trade }) => {
  return (
    <div className={`border border-gray-400 p-4 rounded ${trade.priority === "high" && "bg-yellow-50"} ${trade.priority === "medium" && "bg-indigo-50"} ${trade.priority === "low" && "bg-gray-100"}`}>
      <div className="text-center">{convertToGreekTime(trade.openTime)}</div>
      <div className="text-center">{trade._id.toString()}</div>
      <div className="text-center">{trade.status}</div>
      <div className={`grid grid-cols-2`}>
        <div className={`p-4 flex flex-col gap-2`}>
          <div className="text-center">
            {trade.firstParticipant.user.firstName} {trade.firstParticipant.user.lastName}
          </div>
          <div className="text-xs flex gap-4 justify-center">
            <div>{trade.firstParticipant.account.number}</div>
            <div>{trade.firstParticipant.account.company.name}</div>
            <div>{trade.firstParticipant.account.phase}</div>
            <div>{trade.firstParticipant.account.balance}</div>
          </div>
          <div className="text-center">
            {trade.firstParticipant.status} - {trade.firstParticipant.priority}
          </div>
        </div>
        <div className={`p-4 flex flex-col gap-2`}>
          <div className="text-center">
            {trade.secondParticipant.user.firstName} {trade.secondParticipant.user.lastName}
          </div>
          <div className="text-xs flex gap-4 justify-center">
            <div>{trade.secondParticipant.account.number}</div>
            <div>{trade.secondParticipant.account.company.name}</div>
            <div>{trade.secondParticipant.account.phase}</div>
            <div>{trade.secondParticipant.account.balance}</div>
          </div>
          <div className="text-center">
            {trade.secondParticipant.status} - {trade.secondParticipant.priority}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeCard;

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
