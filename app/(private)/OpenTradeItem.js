import AwareButton from "./AwareButton";
import OpenTradeButton from "./OpenTradeButton";
import Link from "next/link";
import TradeCheckedButton from "./TradeCheckedButton";

const OpenTradeItem = ({ BeAwareOfTrade, telephone, opponentName, TradeChecked, OpenTrade, tradeId, userId, account, accountId, openDate, openTime, status, accountCheck, tradeCheck, checked, trade }) => {
  return (
    <div className={`grid grid-cols-12 relative ${status === "try" && "opacity-50"} ${checked && "opacity-25"} border ${status === "accepted" ? "bg-gray-100" : "bg-green-100"} w-full`}>
      {telephone && (
        <div className="absolute -top-6 right-0">
          <a href={`tel:${telephone}`} className="flex items-center gap-2" style={{ color: "blue", textDecoration: "none" }}>
            <div>📞</div>
            <div>{opponentName}</div>
            <div>{telephone}</div>
          </a>
        </div>
      )}
      {status === "accepted" && <AwareButton BeAwareOfTrade={BeAwareOfTrade} tradeId={tradeId} userId={userId} />}
      {status !== "try" && (
        <div className={`${status === "open" ? "col-span-12 sm:col-span-2 lg:col-span-2" : "col-span-9 sm:col-span-9 lg:col-span-10"} text-gray-700 flex flex-col justify-center p-2 ${status === "canceled" && "opacity-25"}`}>
          <div className="text-center text-lg">{account}</div>
          <div className="text-center font-bold text-2xl">{openTime}</div>
          <div className="text-center text-xs">{openDate}</div>
        </div>
      )}
      {status === "try" && (
        <div className="col-span-12 text-gray-950 flex justify-center p-2">
          Το trade στο account {account} στις {openTime} <span className="font-bold ml-1">ακυρώθηκε</span>
        </div>
      )}
      {status === "aware" && <OpenTradeButton OpenTrade={OpenTrade} accountId={accountId} tradeId={tradeId} userId={userId} />}
      {status === "open" && (
        <div className="col-span-12 sm:col-span-10">
          {!accountCheck && !tradeCheck && !checked && (
            <div className="h-full grid grid-cols-12 p-4 md:p-0">
              <div className="col-span-12 md:col-span-10 flex flex-col gap-2 justify-center items-center">
                <div className="text-center text-black font-bold">Είσαι μέσα στο σωστό account;</div>
                <div className="font-bold text-2xl text-center">{account}</div>
              </div>

              <Link href={`/?accountcheck=true&tradepar=${tradeId}`} className="col-span-12 md:col-span-2 md:mt-0 mt-2 py-2 flex justify-center items-center bg-green-500 text-white font-bold text-3xl">
                ✔
              </Link>
            </div>
          )}
          {(accountCheck || checked) && (
            <div className="grid grid-cols-6 p-4 lg:p-0 h-full">
              <div className={`${checked ? "col-span-6" : "col-span-6 lg:col-span-5"} flex flex-col gap-1 justify-center items-center`}>
                <div className="flex flex-wrap gap-4">
                  <div className="font-bold text-black text-lg">{trade.pair}</div>
                  <div className="font-bold text-black text-lg">{trade.position.toUpperCase()}</div>
                  <div className="text-sm text-gray-400">
                    Lots: <span className="font-bold text-black text-lg">{trade.lots.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="text-sm text-gray-400">
                    SL: <span className="font-bold text-red-700 text-lg">${Math.round(trade.stopLoss).toLocaleString("en-US").replace(/,/g, ".")}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    TP: <span className="font-bold text-green-700 text-lg">${Math.round(trade.takeProfit).toLocaleString("en-US").replace(/,/g, ".")}</span>
                  </div>
                </div>
              </div>

              {!checked && (
                <Link href={`/?tradecheck=true`} className="col-span-6 lg:col-span-1 lg:mt-0 mt-2 p-2 flex justify-center items-center bg-green-500 text-white font-bold text-3xl">
                  ✔
                </Link>
              )}
            </div>
          )}
          {tradeCheck && !checked && (
            <div className="grid grid-cols-6 h-full p-4 lg:p-0">
              <div className="col-span-6 lg:col-span-5 flex flex-col gap-1 justify-center items-center">
                <div className="text-gray-500">Βεβαίωσε ότι έλεγξες όλα τα παρακάτω:</div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <div>
                    1. <span className=" font-bold">Account</span>
                  </div>
                  <div>
                    2. <span className=" font-bold">Take Profit</span>
                  </div>
                  <div>
                    3. <span className=" font-bold">Stop Loss</span>
                  </div>
                  <div>
                    4. <span className=" font-bold">Position</span>
                  </div>
                  <div>
                    5. <span className=" font-bold">Lots</span>
                  </div>
                </div>
              </div>

              <TradeCheckedButton TradeChecked={TradeChecked} tradeId={tradeId} userId={userId} accountId={accountId} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OpenTradeItem;
