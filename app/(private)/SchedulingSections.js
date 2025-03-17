export const dynamic = "force-dynamic";

import dbConnect from "@/dbConnect";
import { revalidatePath } from "next/cache";
import Trade from "@/models/Trade";
import Settings from "@/models/Settings";
import TradeItem from "./TradeItem";
import Explanation from "@/components/Explanation";
import Link from "next/link";
import { ConvertToUserTime } from "@/library/Hours";

const ChangeTradeStatus = async ({ tradeId, userId, status, accountId, priority }) => {
  "use server";
  try {
    await dbConnect();

    // Φέρνουμε τα settings
    const settings = await Settings.findOne();
    if (!settings) return { error: true, message: "Δεν βρέθηκαν ρυθμίσεις." };

    // Υπολογισμός της ώρας Ελλάδας
    const now = new Date();
    const greekOffset = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Athens", hour12: false, hour: "numeric" }).format(now);
    const greekHour = parseInt(greekOffset);

    // Έλεγχος αν η ώρα είναι μέσα στο acceptTradesHours
    const { startingHour, endingHour } = settings.acceptTradesHours;
    if (greekHour < startingHour || greekHour >= endingHour) {
      return { error: true, message: "Δεν μπορείτε να αποδεχτείτε ή απορρίψετε το trade αυτή τη στιγμή. Έχει παρέλθει η ώρα του προγραμματισμού." };
    }

    // Αλλαγή status του trade για τον user
    const trade = await Trade.findById(tradeId).populate("firstParticipant.account").populate("secondParticipant.account");

    if (!trade) return { error: true, message: "Δεν βρέθηκε το trade. Προσπάθησε ξανά." };
    if (trade.firstParticipant.user._id.toString() === userId) {
      trade.firstParticipant.status = status;
      trade.firstParticipant.account.note = status === "accepted" ? "Επερχόμενο Trade" : "";
      await trade.firstParticipant.account.save();
    }
    if (trade.secondParticipant.user._id.toString() === userId) {
      trade.secondParticipant.status = status;
      trade.secondParticipant.account.note = status === "accepted" ? "Επερχόμενο Trade" : "";
      await trade.secondParticipant.account.save();
    }
    await trade.save();

    // Εισαγωγή του activity
    let activityTitle;
    let activityDescription;
    let activitySign = "neutral";
    if (status === "accepted") {
      activityTitle = "Αποδοχή Trade";
      activityDescription = "Ο χρήστης αποδέχτηκε το trade";
      if (priority === "low") activitySign = "positive";
    }
    if (status === "canceled") {
      activityTitle = "Απόρριψη Trade";
      activityDescription = "Ο χρήστης απέρριψε το trade";
      if (priority === "high") activitySign = "negative";
    }
    await AddActivity({ user: userId, trade: tradeId, account: accountId, title: activityTitle, description: activityDescription, sign: activitySign });
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην ChangeTradeStatus στο root", error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const SchedulingSection = ({ GreeceTime, settings, user, tradeSuggestions, mode }) => {
  if (mode) return null;

  const text = `Η φάση του προγραμματισμού είναι ενεργή κάθε μέρα από 
  τις ${settings.acceptTradesHours.startingHour + user.hourOffsetFromGreece}:00 έως 
  τις ${settings.acceptTradesHours.endingHour + user.hourOffsetFromGreece}:00. 
  Πάτησε Accept στα trades που μπορείς να βάλεις αύριο. 
  Τα trades με ανοιχτό πορτοκαλί background είναι εντός ωρών που εσύ έχεις δηλώσει ότι μπορείς να βάλεις. 
  Συνεπώς αν τα απορρίψεις θα χρεωθούν στον λογαριασμό σου 10$ για το κάθε ένα. 
  Τα trades με το γκρι background είναι εκτός ωρών σου και μπορείς να τα απορρίψεις χωρίς κανένα πρόβλημα.
  Τις ημέρες που ξέρεις ότι σίγουρα δεν μπορείς να βάζεις trades εκτός των ωρών σου είναι καλό να απενεργοποιείς
  την λειτουργία Flexible Suggestions από τα settings ώστε να μην σε λαμβάνει υπόψην του ο αλγόριθμος.
  Αν πιστεύεις ότι υπάρχει έστω μια περίπτωση κάποια άλλη ώρα να μπορείς να βάλεις κάποιο trade ενεργοποίησε την
  λειτουργία Flexible Suggestions. Για κάθε trade που βάζεις εκτός των ωρών σου σου πιστώνεται και ένα μικρό bonus 3$.`;

  if (GreeceTime >= settings.acceptTradesHours.startingHour && GreeceTime < settings.acceptTradesHours.endingHour) {
    return (
      <div className="flex flex-col gap-4">
        <div className="font-semibold">Προγραμματισμός</div>
        <div className="flex flex-col gap-1">
          <Explanation text={text} lettersShow={50} classes="text-gray-400 text-sm" />
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <div>Πήγαινε στο:</div>
            <Link href="/?mode=tradingsettings" className="text-blue-400 hover:underline">
              Flexible Suggestions
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {tradeSuggestions &&
            tradeSuggestions.length > 0 &&
            tradeSuggestions.map((trade) => {
              const timeObject = ConvertToUserTime(trade.openTime, user.hourOffsetFromGreece);

              let tradeUser;
              if (trade.firstParticipant.user._id.toString() === user._id.toString()) tradeUser = trade.firstParticipant;
              if (trade.secondParticipant.user._id.toString() === user._id.toString()) tradeUser = trade.secondParticipant;
              return <TradeItem ChangeTradeStatus={ChangeTradeStatus} tradeId={trade._id.toString()} userId={tradeUser.user._id.toString()} key={`trade-${trade._id.toString()}`} account={tradeUser.account.number} priority={tradeUser.priority} openDate={timeObject.date} openTime={timeObject.time} status={tradeUser.status} />;
            })}
          {(!tradeSuggestions || tradeSuggestions.length === 0) && <div className="animate-pulse text-gray-500">Δεν υπάρχουν trades για εσένα για αύριο</div>}
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default SchedulingSection;
