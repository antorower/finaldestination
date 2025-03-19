export const dynamic = "force-dynamic";
import PageTransition from "@/components/PageTransition";
import dbConnect from "@/dbConnect";
import Trade from "@/models/Trade";
import AcceptedCard from "./AcceptedCard";
import ReviewCard from "./ReviewCard";

import Account from "@/models/Account";
import RandomizeAccounts from "./RandomizeAccountsButton";
import { revalidatePath } from "next/cache";

const GetTrades = async () => {
  "use server";
  try {
    await dbConnect();

    return await Trade.find({ status: { $ne: "completed" } }).populate([{ path: "firstParticipant.user" }, { path: "firstParticipant.account", populate: { path: "company" } }, { path: "secondParticipant.user" }, { path: "secondParticipant.account", populate: { path: "company" } }]);
  } catch (error) {
    console.log("Υπήρξε error στην GetTrades στο /trades: ", error);
    return null;
  }
};

const updateAccountsRandomly = async () => {
  "use server";
  try {
    await dbConnect();
    // 🔹 Φέρνουμε όλα τα accounts μαζί με τα δεδομένα της εταιρείας τους
    const accounts = await Account.find().populate("company").exec();

    const bulkOperations = [];

    for (const account of accounts) {
      // Αν δεν υπάρχει η εταιρεία, παράλειψε το account
      if (!account.company) {
        console.warn(`❌ Company not found for account ${account._id}`);
        continue;
      }

      // 🔹 Επιλογή τυχαίου phase (1 έως 3)
      account.phase = Math.floor(Math.random() * 3) + 1;

      // 🔹 Επιλογή τυχαίου balance (90000 έως 101000)
      account.balance = Math.floor(Math.random() * (101000 - 90000 + 1)) + 90000;

      // 🔹 Σταθερές τιμές
      account.status = "Live";
      account.isOnBoarding = false;
      account.needBalanceUpdate = false;

      // 🔹 Επιλογή της σωστής φάσης από τα δεδομένα της εταιρείας
      const phases = ["phase1", "phase2", "phase3"];
      const companyPhase = phases[account.phase - 1];

      if (!account.company[companyPhase]) {
        console.warn(`⚠️ Phase data missing for ${companyPhase} in company ${account.company._id}`);
        continue;
      }

      // 🔹 Υπολογισμός στόχου και drawdown
      const targetPercentage = account.company[companyPhase].target;
      const drawdownPercentage = account.company[companyPhase].totalDrawdown;

      if (typeof targetPercentage !== "number" || typeof drawdownPercentage !== "number") {
        console.warn(`⚠️ Invalid data for ${companyPhase}: missing target or totalDrawdown`);
        continue;
      }

      const target = account.capital + (account.capital * targetPercentage) / 100;
      const finalDrawdownBalance = account.capital - (account.capital * drawdownPercentage) / 100;
      const totalAmount = target - finalDrawdownBalance;

      // 🔹 Υπολογισμός progress
      account.progress = totalAmount > 0 ? Math.floor(((account.balance - finalDrawdownBalance) / totalAmount) * 100) : 0;

      // 🔹 Δημιουργία του bulk operation για την αποθήκευση του account
      bulkOperations.push({
        updateOne: {
          filter: { _id: account._id },
          update: {
            $set: {
              phase: account.phase,
              balance: account.balance,
              status: account.status,
              isOnBoarding: account.isOnBoarding,
              needBalanceUpdate: account.needBalanceUpdate,
              progress: account.progress,
            },
          },
        },
      });
    }

    // 🔹 Εκτέλεση όλων των bulk operations
    if (bulkOperations.length > 0) {
      await Account.bulkWrite(bulkOperations);
    }

    console.log("✅ Όλα τα accounts ενημερώθηκαν επιτυχώς!");
    return true;
  } catch (error) {
    console.error("❌ Σφάλμα κατά την ενημέρωση των accounts:", error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const Trades = async () => {
  const trades = await GetTrades();

  const pendingTrades = trades.filter((trade) => trade.status === "pending").sort((a, b) => new Date(a.openTrade) - new Date(b.openTrade));
  const acceptedTrades = trades.filter((trade) => trade.status === "accepted").sort((a, b) => new Date(a.openTrade) - new Date(b.openTrade));
  const openTrades = trades.filter((trade) => trade.status === "open").sort((a, b) => new Date(a.openTrade) - new Date(b.openTrade));
  const reviewTrades = trades.filter((trade) => trade.status === "review").sort((a, b) => new Date(a.openTrade) - new Date(b.openTrade));

  return (
    <PageTransition>
      <div className="flex flex-col gap-4 pb-4">
        {pendingTrades && pendingTrades.length > 0 && (
          <div className="flex flex-col gap-8">
            <div className="sticky top-0 z-10 flex justify-center items-center text-white font-bold bg-blue-500 p-2 rounded text-2xl">Pending</div>
            {pendingTrades.map((trade) => (
              <AcceptedCard trade={trade} key={`trade-${trade._id.toString()}`} />
            ))}
          </div>
        )}

        {acceptedTrades && acceptedTrades.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="sticky top-0 z-10 flex justify-center items-center text-white font-bold bg-blue-500 p-2 rounded text-2xl">Accepted</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {acceptedTrades.map((trade) => (
                <AcceptedCard trade={trade} key={`trade-${trade._id.toString()}`} />
              ))}
            </div>
          </div>
        )}

        {openTrades && openTrades.length > 0 && (
          <div className="flex flex-col gap-8">
            <div className="sticky top-0 z-10 flex justify-center items-center text-white font-bold bg-blue-500 p-2 rounded text-2xl">Open</div>
            {openTrades.map((trade) => (
              <AcceptedCard trade={trade} key={`trade-${trade._id.toString()}`} />
            ))}
          </div>
        )}

        {reviewTrades && reviewTrades.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="sticky top-0 z-10 flex justify-center items-center text-white font-bold bg-blue-500 p-2 rounded text-2xl">Review</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {reviewTrades.map((trade) => (
                <ReviewCard trade={trade} key={`trade-${trade._id.toString()}`} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Trades;

<RandomizeAccounts Randomize={updateAccountsRandomly} />;
