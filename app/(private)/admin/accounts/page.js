export const dynamic = "force-dynamic";

import Link from "next/link";
import dbConnect from "@/dbConnect";
import Account from "@/models/Account";
import { auth } from "@clerk/nextjs/server";
import User from "@/models/User";
import InfoButton from "@/components/InfoButton";

const GetAllAccounts = async () => {
  "use server";
  try {
    await dbConnect();
    return await Account.find({ status: { $ne: "lost" } })
      .populate({
        path: "user",
        select: "firstName lastName",
      })
      .populate({
        path: "company",
        select: "name",
      })
      .populate({
        path: "lastTrade",
        select: "openTime",
      })
      .select("number phase balance status isOnBoarding needBalanceUpdate adminCaseOn adminNote progress lastTrade note")
      .sort({ progress: 1 })
      .lean(); // Φιλτράρει όλα εκτός από τα "lost"
  } catch (error) {
    console.log("Υπήρξε error στην GetAllAccount στο /admin/accounts", error);
    return false;
  }
};

const GetUserTeamAccounts = async (userId) => {
  "use server";
  try {
    await dbConnect();

    // Βρίσκουμε τον χρήστη που κάνει το request
    const user = await User.findById(userId).select("team");
    if (!user || !user.team || user.team.length === 0) {
      return [];
    }

    // Βρίσκουμε τα accounts που ανήκουν σε users που είναι στο `team` του
    return await Account.find({ user: { $in: user.team }, status: { $ne: "lost" } })
      .populate({
        path: "user",
        select: "firstName lastName",
      })
      .populate({
        path: "company",
        select: "name",
      })
      .populate({
        path: "lastTrade",
        select: "openTime",
      })
      .select("number phase balance status isOnBoarding needBalanceUpdate adminCaseOn adminNote progress lastTrade note")
      .sort({ progress: 1 })
      .lean();
  } catch (error) {
    console.log("Υπήρξε error στην GetUserTeamAccounts στο /admin/accounts", error);
    return false;
  }
};

const Accounts = async () => {
  const { sessionClaims } = await auth();
  const { isOwner, mongoId } = sessionClaims.metadata;

  // Αν είναι owner, επιστρέφει όλα τα accounts, αλλιώς μόνο τα accounts των users από το `team` του
  const accounts = isOwner ? await GetAllAccounts() : await GetUserTeamAccounts(mongoId);
  if (!accounts || accounts.length === 0) return <div className="text-center text-gray-500 animate-pulse">Δεν υπάρχουν accounts</div>;

  return (
    <div className="flex flex-col justify-center gap-4">
      <div className="hidden md:flex justify-between">
        <div className="bg-gray-100 py-2 px-4 rounded border border-gray-500 text-gray-500 font-bold">Total Accounts: {accounts.length}</div>
        <div className="flex items-center gap-2">
          <div className="bg-blue-200 border-2 border-blue-300 h-[18px] w-[18px] rounded-full"></div>
          <div className="font-bold">First Phase:</div>
          <div> {accounts.filter((a) => a.phase === 1).length}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-violet-200 border-2 border-violet-300 h-[18px] w-[18px] rounded-full"></div>
          <div className="font-bold">Second Phase:</div>
          <div> {accounts.filter((a) => a.phase === 2).length}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-orange-200 border-2 border-orange-300 h-[18px] w-[18px] rounded-full"></div>
          <div className="font-bold">Third Phase:</div>
          <div> {accounts.filter((a) => a.phase === 3).length}</div>
        </div>
        <InfoButton message="Τα μπλε accounts είναι φάση 1, τα violet φάση 2 και τα πορτοκαλί φάση 3. Αυτά που είναι με πράσινο πλαίσιο χρειάζονται ενημέρωση balance. Η κουκίδα αριστερά από το account number προσδιορίζει αν είναι active για trading ή όχι." />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {accounts.map((account) => {
          if (account.phase !== 1) return null;
          if (!account.user?.firstName) return null;
          return <Phase1Card key={account._id.toString()} account={account} />;
        })}

        {accounts.map((account) => {
          if (account.phase !== 2) return null;
          if (!account.user?.firstName) return null;
          return <Phase2Card key={account._id.toString()} account={account} />;
        })}

        {accounts.map((account) => {
          if (account.phase !== 3) return null;
          if (!account.user?.firstName) return null;
          return <Phase3Card key={account._id.toString()} account={account} />;
        })}
      </div>
    </div>
  );
};

export default Accounts;

const Phase1Card = ({ account }) => {
  return (
    <Link href={`/account/${account._id.toString()}`} className={`p-4 border-2 ${account.needBalanceUpdate ? "border-green-600" : "border-blue-200"} rounded bg-blue-100`}>
      <div className="flex flex-col gap-1 justify-center">
        <div className="text-center font-semibold text-nowrap overflow-hidden">
          {account.user.firstName} {account.user.lastName}
        </div>
        <div className="flex justify-between">
          <div className={`text-center text-sm flex gap-1 items-center`}>
            <div className="text-xs">{account.isOnBoarding ? "🔵" : "🔴"}</div>
            <div>{account.number}</div>
          </div>
          <div className={`text-center text-sm`}>{account.status}</div>
        </div>
        <div className="flex justify-between text-sm">
          <div>{account.company.name}</div>
          <div>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
              .format(account.balance)
              .replace(/,/g, ".")}
          </div>
        </div>
        <div className="text-center font-bold text-2xl py-4">{account.progress}%</div>

        <div className="text-center text-xs bg-blue-200 p-2 rounded border border-blue-400">{account.note ? account.note : "-"}</div>
      </div>
    </Link>
  );
};

const Phase2Card = ({ account }) => {
  return (
    <Link href={`/account/${account._id.toString()}`} className={`p-4 border-2 ${account.needBalanceUpdate ? "border-green-600" : "border-violet-200"} rounded bg-violet-100`}>
      <div className="flex flex-col gap-1 justify-center">
        <div className="text-center font-semibold text-nowrap overflow-hidden">
          {account.user.firstName} {account.user.lastName}
        </div>
        <div className="flex justify-between">
          <div className={`text-center text-sm flex gap-1 items-center`}>
            <div className="text-xs">{account.isOnBoarding ? "🔵" : "🔴"}</div>
            <div>{account.number}</div>
          </div>
          <div className={`text-center text-sm`}>{account.status}</div>
        </div>
        <div className="flex justify-between text-sm">
          <div>{account.company.name}</div>
          <div>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
              .format(account.balance)
              .replace(/,/g, ".")}
          </div>
        </div>
        <div className="text-center font-bold text-2xl py-4">{account.progress}%</div>

        <div className="text-center text-xs bg-violet-200 p-2 rounded border border-violet-400">{account.note ? account.note : "-"}</div>
      </div>
    </Link>
  );
};

const Phase3Card = ({ account }) => {
  return (
    <Link href={`/account/${account._id.toString()}`} className={`p-4 border-2 ${account.needBalanceUpdate ? "border-green-600" : "border-orange-200"} rounded bg-orange-100`}>
      <div className="flex flex-col gap-1 justify-center">
        <div className="text-center font-semibold text-nowrap overflow-hidden">
          {account.user.firstName} {account.user.lastName}
        </div>
        <div className="flex justify-between">
          <div className={`text-center text-sm flex gap-1 items-center`}>
            <div className="text-xs">{account.isOnBoarding ? "🔵" : "🔴"}</div>
            <div>{account.number}</div>
          </div>
          <div className={`text-center text-sm`}>{account.status}</div>
        </div>
        <div className="flex justify-between text-sm">
          <div>{account.company.name}</div>
          <div>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
              .format(account.balance)
              .replace(/,/g, ".")}
          </div>
        </div>
        <div className="text-center font-bold text-2xl py-4">{account.progress}%</div>

        <div className="text-center text-xs bg-orange-200 p-2 rounded border border-orange-400">{account.note ? account.note : "-"}</div>
      </div>
    </Link>
  );
};
