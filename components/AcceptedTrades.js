import { revalidatePath } from "next/cache";
import Trade from "@/models/Trade";
import UserIsHereButton from "./UserIsHereButton";

const Confirmation = async ({ tradeId, userId }) => {
  "use server";
  // ----> Εδώ ο χρήστης επιβεβαιώνει ότι είναι εδώ 10 με 60 λεπτά πριν το trade
  try {
    const trade = await Trade.findById(tradeId);
    if (!trade) return false;

    // Ορίζουμε τα χρονικά όρια
    const minutesBefore = 0; // 10 λεπτά πριν EDIT 10
    const hourBefore = 100000; // 60 λεπτά (1 ώρα πριν) EDIT 60
    // Παίρνουμε την τρέχουσα ώρα Ελλάδας
    const now = new Date();
    const greeceTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Athens" }));
    // Δημιουργούμε το `openTime` ως Date object
    const openTimeDate = new Date(trade.openTime.year, trade.openTime.month - 1, trade.openTime.day, trade.openTime.hour, trade.openTime.minutes);
    // Υπολογίζουμε το χρονικό διάστημα πριν από το `openTime`
    const beforeMinutes = new Date(openTimeDate.getTime() - minutesBefore * 60 * 1000); // `minutesBefore` λεπτά πριν
    const beforeHour = new Date(openTimeDate.getTime() - hourBefore * 60 * 1000); // `hourBefore` λεπτά πριν (1 ώρα)
    // Ελέγχουμε αν η τρέχουσα ώρα Ελλάδας είναι στο διάστημα `minutesBefore` - `hourBefore` πριν το `openTime`
    const isInTimeRange = greeceTime >= beforeHour && greeceTime <= beforeMinutes;
    if (!isInTimeRange) return false;

    const isFirstParticipant = trade.firstParticipant.user.toString() === userId;
    const isSecondParticipant = trade.secondParticipant.user.toString() === userId;

    if (isFirstParticipant) {
      trade.firstParticipant.status = "aware";
    }
    if (isSecondParticipant) {
      trade.secondParticipant.status = "aware";
    }

    await trade.save();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const AcceptedTrades = ({ trades, user, AwareTrade }) => {
  return (
    <div className="flex flex-wrap justify-center gap-8 my-8">
      {trades &&
        trades.length > 0 &&
        trades.map((trade, index) => {
          let account;
          let status;

          const day = trade.openTime.dayString;
          const date = trade.openTime.day + "/" + trade.openTime.month;
          const hour = trade.openTime.hour + ":" + (trade.openTime.minutes < 10 ? `0${trade.openTime.minutes}` : trade.openTime.minutes);

          if (trade.firstParticipant.user._id.toString() === user._id.toString()) {
            account = trade.firstParticipant.account.number;
            status = trade.firstParticipant?.status;
          }
          if (trade.secondParticipant.user._id.toString() === user._id.toString()) {
            account = trade.secondParticipant.account.number;
            status = trade.secondParticipant?.status;
          }

          // Υπολογισμός χρόνου επιβεβαίωσης
          const openTimeDate = new Date(trade.openTime.year, trade.openTime.month - 1, trade.openTime.day, trade.openTime.hour, trade.openTime.minutes);

          const minutesBefore = 10; // 10 λεπτά πριν
          const hourBefore = 60; // 60 λεπτά πριν

          const beforeMinutes = new Date(openTimeDate.getTime() - minutesBefore * 60 * 1000);
          const beforeHour = new Date(openTimeDate.getTime() - hourBefore * 60 * 1000);

          // Μορφοποίηση ώρας για εμφάνιση
          const formatTime = (dateObj) => {
            const h = dateObj.getHours();
            const m = dateObj.getMinutes();
            return `${h}:${m < 10 ? `0${m}` : m}`;
          };

          return (
            <div key={`acceped-${account}-${index}`} className="border border-blue-600 px-6 py-4 bg-blue-800 flex flex-col gap-2 rounded">
              <div className="text-2xl font-black">{account}</div>
              <div className="font-black">
                {day}, {date} στις {hour}
              </div>
              <div className="text-yellow-300 font-bold text-sm">
                Επιβεβαίωση: {formatTime(beforeHour)} - {formatTime(beforeMinutes)}
              </div>
              <UserIsHereButton tradeId={trade._id.toString()} userId={user._id.toString()} Confirmation={Confirmation} />
            </div>
          );
        })}
    </div>
  );
};

export default AcceptedTrades;
