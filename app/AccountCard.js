import Link from "next/link";

const AccountCard = ({ account }) => {
  let lightColor;
  let darkColor;
  let textColor;
  if (account.phase === 1) {
    lightColor = "bg-blue-100";
    darkColor = "bg-blue-500";
    textColor = "text-blue-500";
  }
  if (account.phase === 2) {
    lightColor = "bg-purple-100";
    darkColor = "bg-purple-500";
    textColor = "text-purple-500";
  }
  if (account.phase === 3) {
    lightColor = "bg-orange-100";
    darkColor = "bg-orange-500";
    textColor = "text-orange-500";
  }

  return (
    <Link href={`/account/${account._id.toString()}`} className={`border border-gray-300 rounded p-4 w-full max-w-[250px] hover:scale-105 transition-transform duration-300 ${lightColor} flex flex-col gap-4`}>
      <div className="grid grid-cols-6">
        <div className="col-span-5">
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
    </Link>
  );
};

export default AccountCard;
