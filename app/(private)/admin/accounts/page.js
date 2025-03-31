export const dynamic = "force-dynamic";

import Link from "next/link";
import dbConnect from "@/dbConnect";
import Account from "@/models/Account";
import { auth } from "@clerk/nextjs/server";
import User from "@/models/User";
import InfoButton from "@/components/InfoButton";
import Nav from "./NavigatorComp";

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

const summarizeAccountsByCompany = (accounts) => {
  const summary = {};

  accounts.forEach((account) => {
    const companyName = account.company.name;

    if (!summary[companyName]) {
      summary[companyName] = {
        companyName,
        phase1Accounts: 0,
        phase2Accounts: 0,
        phase3Accounts: 0,
        value: 0,
      };
    }

    if (account.phase === 1) {
      summary[companyName].phase1Accounts += 1;
      summary[companyName].value += 1;
    } else if (account.phase === 2) {
      summary[companyName].phase2Accounts += 1;
      summary[companyName].value += 1.81;
    } else if (account.phase === 3) {
      summary[companyName].phase3Accounts += 1;
      summary[companyName].value += 2.75;
    }
  });

  return Object.values(summary);
};

const Accounts = async () => {
  const { sessionClaims } = await auth();
  const { isOwner, mongoId } = sessionClaims.metadata;

  // Αν είναι owner, επιστρέφει όλα τα accounts, αλλιώς μόνο τα accounts των users από το `team` του
  const accounts = isOwner ? await GetAllAccounts() : await GetUserTeamAccounts(mongoId);
  if (!accounts || accounts.length === 0) return <div className="text-center text-gray-500 animate-pulse">Δεν υπάρχουν accounts</div>;

  const companySummaries = summarizeAccountsByCompany(accounts);

  const phase1Accounts = accounts.filter((a) => a.phase === 1);
  const avgPhase1Progress = phase1Accounts.length > 0 ? Math.round(phase1Accounts.reduce((sum, acc) => sum + (acc.progress || 0), 0) / phase1Accounts.length) : 0;

  const phase2Accounts = accounts.filter((a) => a.phase === 2);
  const avgPhase2Progress = phase2Accounts.length > 0 ? Math.round(phase2Accounts.reduce((sum, acc) => sum + (acc.progress || 0), 0) / phase2Accounts.length) : 0;

  const phase3Accounts = accounts.filter((a) => a.phase === 3);
  const avgPhase3Progress = phase3Accounts.length > 0 ? Math.round(phase3Accounts.reduce((sum, acc) => sum + (acc.progress || 0), 0) / phase3Accounts.length) : 0;
  return (
    <div className="flex flex-col justify-center gap-4">
      <div className="hidden md:flex justify-between">
        <div className="bg-gray-100 py-2 px-4 rounded border border-gray-500 text-gray-500 font-bold">Total Accounts: {accounts.length}</div>
        <div className="flex items-center gap-2">
          <div className="bg-blue-200 border-2 border-blue-300 h-[18px] w-[18px] rounded-full"></div>
          <div className="font-bold">First Phase:</div>
          <div> {accounts.filter((a) => a.phase === 1).length}</div>
          <div>({avgPhase1Progress}%)</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-violet-200 border-2 border-violet-300 h-[18px] w-[18px] rounded-full"></div>
          <div className="font-bold">Second Phase:</div>
          <div> {accounts.filter((a) => a.phase === 2).length}</div>
          <div>({avgPhase2Progress}%)</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-orange-200 border-2 border-orange-300 h-[18px] w-[18px] rounded-full"></div>
          <div className="font-bold">Third Phase:</div>
          <div> {accounts.filter((a) => a.phase === 3).length}</div>
          <div>({avgPhase3Progress}%)</div>
        </div>
        <InfoButton message="Τα μπλε accounts είναι φάση 1, τα violet φάση 2 και τα πορτοκαλί φάση 3. Αυτά που είναι με πράσινο πλαίσιο χρειάζονται ενημέρωση balance. Η κουκίδα αριστερά από το account number προσδιορίζει αν είναι active για trading ή όχι." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {companySummaries.map((summary) => (
          <div key={summary.companyName} className="flex flex-col gap-4 border border-gray-300 rounded p-4">
            <div className="text-xl font-bold">{summary.companyName}</div>
            <div>
              <span className="font-medium">Phase 1 Accounts:</span> {summary.phase1Accounts}
            </div>
            <div>
              <span className="font-medium">Phase 2 Accounts:</span> {summary.phase2Accounts}
            </div>
            <div>
              <span className="font-medium">Phase 3 Accounts:</span> {summary.phase3Accounts}
            </div>
            <div className="font-semibold">Total Value: {summary.value.toFixed(0)}</div>
          </div>
        ))}
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
    <div className={`p-4 border-2 ${account.needBalanceUpdate ? "border-green-600" : "border-blue-200"} rounded bg-blue-100`}>
      <div className="flex flex-col gap-1 justify-center">
        <Link href={`/?userid=${account.user._id.toString()}`} className="text-center font-semibold text-nowrap overflow-hidden">
          {account.user.firstName} {account.user.lastName}
        </Link>
        <div className="flex justify-between">
          <Link href={`/account/${account._id.toString()}`} className={`text-center text-sm flex gap-1 items-center`}>
            <div className="text-xs">{account.isOnBoarding ? "🔴" : "🔵"}</div>
            <div>{account.number}</div>
          </Link>
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
    </div>
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
            <div className="text-xs">{account.isOnBoarding ? "🔴" : "🔵"}</div>
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
            <div className="text-xs">{account.isOnBoarding ? "🔴" : "🔵"}</div>
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
