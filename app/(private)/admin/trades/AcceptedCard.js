const AcceptedCard = ({ trade }) => {
  return (
    <div className={`border border-gray-400 p-4 rounded ${trade.priority === "high" && "bg-yellow-50"} ${trade.priority === "medium" && "bg-indigo-50"} ${trade.priority === "low" && "bg-gray-100"}`}>
      <div className="text-center text-sm text-gray-600">{convertToGreekTime(trade.openTime)}</div>
      <div className={`grid grid-cols-2`}>
        <Participant participant={trade.firstParticipant} />
        <Participant participant={trade.secondParticipant} />
      </div>
    </div>
  );
};

export default AcceptedCard;

const Participant = ({ participant }) => {
  return (
    <div className={`p-4 flex flex-col justify-center gap-2`}>
      <div className={`text-center font-bold ${participant.status === "accepted" && "text-green-500"}`}>
        {participant.user.firstName.slice(0, 8)} {participant.user.lastName.slice(0, 3)}.
      </div>
      <div className="text-xs flex gap-4 justify-center">
        <div className="flex flex-col items-center gap-2 justify-center">
          <div>{participant.account.number}</div>
          <div>{participant.account.company.name}</div>
        </div>
        <div className="flex flex-col items-center gap-2 justify-center">
          <div>{participant.account.phase}</div>
          <div>{participant.account.balance}</div>
        </div>
      </div>

      <div className={`text-center ${participant.priority === "high" && participant.status === "rejected" && "animate-bounce text-red-500 text-center text-xs"}`}>{participant.priority}</div>
      <div className="text-center">{participant.status}</div>
      {participant?.trade?.pair && (
        <div className="flex flex-col items-center justify-center">
          <div className="text-center">{participant.trade.pair}</div>
          <div className="text-center">{participant.trade.lots}</div>
          <div className="text-center">{participant.trade.position}</div>
          <div className="text-center">{participant.trade.stopLoss}</div>
          <div className="text-center">{participant.trade.takeProfit}</div>
        </div>
      )}
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
