import Link from "next/link";

const AccountCard = ({ account }) => {
  let lightColor;
  let darkColor;
  let textColor;
  let borderColor;
  if (account.phase === 1) {
    lightColor = "bg-blue-100";
    darkColor = "bg-blue-500";
    textColor = "text-blue-500";
    borderColor = "border-blue-300";
  }
  if (account.phase === 2) {
    lightColor = "bg-purple-100";
    darkColor = "bg-purple-500";
    textColor = "text-purple-500";
    borderColor = "border-purple-300";
  }
  if (account.phase === 3) {
    lightColor = "bg-orange-100";
    darkColor = "bg-orange-500";
    textColor = "text-orange-500";
    borderColor = "border-orange-300";
  }
  if (account.isOnBoarding) {
    lightColor = "bg-red-100";
    darkColor = "bg-red-500";
    textColor = "text-red-500";
    borderColor = "border-red-300";
  }

  return (
    <Link href={`/account/${account._id.toString()}`} className={`border ${borderColor} rounded p-4 w-full max-w-[250px] ${lightColor} flex flex-col gap-4`}>
      <div className="grid grid-cols-6">
        <div className="col-span-5">
          <div className={`${textColor} font-semibold text-lg`}>{account.company.name}</div>
          <div className={`text-lg font-bold ${textColor}`}>{account.number || "Εκκρεμεί"}</div>
          <div className={`${textColor} font-semibold text-sm`}>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
            })
              .format(account.balance)
              .replace(",", ".")}
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-1">
          <div className={`h-full ${account.phase > 2 ? darkColor : lightColor} rounded-sm`}></div>
          <div className={`h-full ${account.phase > 1 ? darkColor : lightColor} rounded-sm`}></div>
          <div className={`h-full ${darkColor} rounded-sm`}></div>
        </div>
      </div>
      <div className={`${account.note && "animate-bounce"} ${darkColor} text-sm text-white rounded p-2 text-center`}>{account.note || "-"}</div>
      <div className={`w-full relative h-2 bg-gray-200 rounded-full overflow-hidden border border-gray-300`}>
        <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${account.progress < 20 && "bg-red-500"} ${account.progress >= 20 && account.progress < 50 && "bg-orange-500"} ${account.progress >= 50 && account.progress < 80 && "bg-blue-500"} ${account.progress >= 80 && "bg-green-500"}`} style={{ width: `${account.progress}%` }}></div>
      </div>
    </Link>
  );
};

export default AccountCard;
