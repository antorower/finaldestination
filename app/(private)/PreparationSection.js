export const dynamic = "force-dynamic";

import TomorrowTradeItem from "./TomorrowTradeItem";
import Explanation from "@/components/Explanation";

const PreparationSection = ({ GreeceTime, user, forOpening, settings, mode }) => {
  if (mode) return null;

  const text = `Ακριβώς από κάτω, κάθε μέρα 
  μετά τις ${settings.seeScheduleHours.startingHour + user.hourOffsetFromGreece}:00, θα βρίσκεις 
  τα trades που πρέπει να βάλεις την επόμενη ημέρα. Θα πρέπει να βάλεις τα ξυπνητήρια σου ώρες τέτοιες
  ώστε να μπορέσεις να διεκπεραιώσεις τα trades σίγουρα, χωρίς βιασύνη, με άνεση χρόνου.`;

  if (GreeceTime >= settings.seeScheduleHours.startingHour && GreeceTime < settings.seeScheduleHours.endingHour) {
    return (
      <div className="flex flex-col gap-4">
        <div className="font-semibold">Προετοιμασία</div>
        <div className="flex flex-col gap-1">
          <Explanation text={text} lettersShow={50} classes="text-gray-400 text-sm" />
        </div>
        <div className="flex gap-4">
          {forOpening &&
            forOpening.length > 0 &&
            forOpening.map((trade) => {
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
              return <TomorrowTradeItem key={`tomorrow-${trade._id.toString()}`} account={tradeUser.account.number} openDate={formattedDate} openTime={formattedTime} />;
            })}

          {(!forOpening || forOpening.length === 0) && <div className="animate-pulse text-gray-500">Δεν υπάρχουν trades για εσένα για αύριο</div>}
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default PreparationSection;
