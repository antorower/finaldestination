export const dynamic = "force-dynamic";

import Explanation from "@/components/Explanation";
import dbConnect from "@/dbConnect";
import Trade from "@/models/Trade";
import { revalidatePath } from "next/cache";
import CloseTradeForm from "./CloseTradeForm";

const UpdateBalance = async ({ tradeId, userId, newBalance }) => {
  "use server";
  try {
    await dbConnect();
    const trade = await Trade.findById(tradeId).populate("firstParticipant.account").populate("secondParticipant.account");
    if (!trade) return { error: true, message: "Δεν βρέθηκε το trade. Προσπάθησε ξανά." };
    let targetedAccount;
    let oldBalance;
    if (trade.firstParticipant.user._id.toString() === userId) {
      trade.firstParticipant.status = "closed";
      oldBalance = trade.firstParticipant.account.balance;
      trade.firstParticipant.profit = newBalance - trade.firstParticipant.account.balance;
      targetedAccount = trade.firstParticipant.account;
      await trade.firstParticipant.account.updateBalance(newBalance, trade.firstParticipant.trade.takeProfit, trade.firstParticipant.trade.stopLoss);
    }
    if (trade.secondParticipant.user._id.toString() === userId) {
      trade.secondParticipant.status = "closed";
      oldBalance = trade.secondParticipant.account.balance;
      trade.secondParticipant.profit = newBalance - trade.secondParticipant.account.balance;
      targetedAccount = trade.secondParticipant.account;
      await trade.secondParticipant.account.updateBalance(newBalance, trade.secondParticipant.trade.takeProfit, trade.secondParticipant.trade.stopLoss);
    }
    await trade.save();

    await AddActivity({ user: userId, account: targetedAccount?._id.toString(), trade: tradeId, title: `Ο χρήστης ενημέρωσε το balance του account ${targetedAccount?.number} από $${oldBalance} σε $${newBalance}` });

    return { error: false, message: "Το balance σου ενημερώθηκε επιτυχώς!" };
  } catch (error) {
    console.log("Υπήρξε ένα πρόβλημα στην UpdateBalance στο root", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const UpdateBalanceSection = ({ GreeceTime, settings, openTrades, user, mode }) => {
  if (mode) return null;

  const text = `Η φάση της ενημέρωσης είναι ενεργή κάθε μέρα από 
  τις ${settings.updateBalanceHours.startingHour + user.hourOffsetFromGreece}:00 
  έως τις ${settings.updateBalanceHours.endingHour + user.hourOffsetFromGreece}:00. 
  Σε αυτό το διάστημα θα πρέπει να ενημερώσεις το balance του account σου.
  Τα trades όμως θα πρέπει να ελέγχεις κάθε μέρα γιατί θα πρέπει να κλείνουν συγκεκριμένη ώρα.`;

  if (GreeceTime >= settings.updateBalanceHours.startingHour && GreeceTime < settings.updateBalanceHours.endingHour) {
    return (
      <div className="flex flex-col gap-4">
        <div className="font-semibold">Ενημέρωση</div>
        <div className="flex flex-col gap-1">
          <Explanation text={text} lettersShow={50} classes="text-gray-400 text-sm" />
        </div>
        <div className="flex flex-col gap-4">
          {openTrades &&
            openTrades.length > 0 &&
            openTrades.map((trade) => {
              // Μετατροπή ξανά σε Date object για να προσθέσουμε το hourOffsetFromGreece
              const greeceDateObject = new Date(trade.openTime);
              // Δημιουργούμε το τελικό Date object με το σωστό offset
              greeceDateObject.setHours(greeceDateObject.getHours() + user.hourOffsetFromGreece);
              const formattedDate = greeceDateObject.toLocaleDateString("el-GR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              });
              const formattedTime = greeceDateObject.toLocaleTimeString("el-GR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });

              let tradeUser;
              if (trade.firstParticipant.user._id.toString() === user._id.toString()) tradeUser = trade.firstParticipant;
              if (trade.secondParticipant.user._id.toString() === user._id.toString()) tradeUser = trade.secondParticipant;
              return <CloseTradeForm UpdateBalance={UpdateBalance} tradeId={trade._id.toString()} userId={tradeUser.user._id.toString()} key={`trade-${trade._id.toString()}`} account={tradeUser.account.number} prevBalance={tradeUser.account.balance} tp={tradeUser.trade.takeProfit} sl={tradeUser.trade.stopLoss} />;
            })}

          {(!openTrades || openTrades.length === 0) && <div className="animate-pulse text-gray-500">Δεν υπάρχουν ανοιχτά trades</div>}
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default UpdateBalanceSection;
