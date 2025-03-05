import Link from "next/link";

const TraderCard = ({ trader }) => {
  const workingHours = trader.tradingHours.endingTradingHour - trader.tradingHours.startingTradingHour;

  return (
    <div className={`rounded-xl bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2`}>
      <div className={`p-4 border-b border-gray-300 rounded-t-lg `}>
        <div className="flex gap-4 items-center justify-between">
          <Link href={`/?userid=${trader._id.toString()}`} className="flex items-center justify-center gap-2 text-xl font-semibold">
            <div>{trader.firstName}</div>
            <div>{trader.lastName}</div>
          </Link>
          <Link href={`/admin/trader/${trader._id.toString()}`}>👀</Link>
        </div>
      </div>
      <div className="flex flex-col text-gray-400 flex-wrap justify-center font-semibold gap-2 border-b border-gray-300 p-3 text-xs">
        <div className="text-center">{trader.bybitEmail}</div>
        <div className="text-center">UID: {trader.bybitUid}</div>
      </div>
      <div className={`text-center border-b border-gray-300 font-black ${trader.accounts.length === 0 ? "text-red-500" : "text-gray-600"} text-3xl p-4`}>
        <div className={`${trader.accounts.length === 0 && "animate-bounce"}`}>{trader.accounts.length}</div>
      </div>
      <div className="text-center border-b border-gray-300 p-4 text-gray-600">{trader.userNote ? trader.userNote.slice(0, 35) : "-"}</div>
      <div className="flex border-b border-gray-300 items-center justify-between p-4 text-gray-500 text-sm">
        <div className="text-green-500 font-bold">Κέρδη: ${trader.profits || 0}</div>
        <div className="text-red-500 font-bold">Χρέος: ${trader.dept || 0}</div>
      </div>
      <div className={`text-center font-bold rounded-b-lg px-4 py-4 text-gray-700 flex items-center gap-4 justify-center`}>
        <div>
          {workingHours === 2 && "💎"} {workingHours > 2 && "💖"}
        </div>
        <div>
          {trader.tradingHours.startingTradingHour}:00 - {trader.tradingHours.endingTradingHour}:00
        </div>
        <div>
          {workingHours === 2 && "💎"} {workingHours > 2 && "💖"}
        </div>
      </div>
    </div>
  );
};

export default TraderCard;
