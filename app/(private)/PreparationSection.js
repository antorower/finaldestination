export const dynamic = "force-dynamic";

import TomorrowTradeItem from "./TomorrowTradeItem";
import Explanation from "@/components/Explanation";
import { ConvertToUserTime } from "@/library/Hours";

const PreparationSection = ({ GreeceTime, user, forOpening, settings, mode }) => {
  if (mode) return null;

  const text = `Ακριβώς από κάτω, κάθε μέρα 
  μετά τις ${settings.seeScheduleHours.startingHour + user.hourOffsetFromGreece}:00, θα βρίσκεις 
  τα trades που πρέπει να βάλεις την επόμενη ημέρα. Θα πρέπει να βάλεις τα ξυπνητήρια σου ώρες τέτοιες
  ώστε να μπορέσεις να διεκπεραιώσεις τα trades σίγουρα, χωρίς βιασύνη, με άνεση χρόνου.`;

  if ((GreeceTime >= settings.seeScheduleHours.startingHour && GreeceTime < settings.seeScheduleHours.endingHour) || GreeceTime < settings.tradingHours.startingHour) {
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
              const timeObject = ConvertToUserTime(trade.openTime, user.hourOffsetFromGreece * 60);

              let tradeUser;
              let opponentUser;
              if (trade.firstParticipant.user._id.toString() === user._id.toString()) {
                tradeUser = trade.firstParticipant;
                opponentUser = trade.secondParticipant;
              }
              if (trade.secondParticipant.user._id.toString() === user._id.toString()) {
                tradeUser = trade.secondParticipant;
                opponentUser = trade.firstParticipant;
              }
              return <TomorrowTradeItem telephone={tradeUser.user.tel && opponentUser.user.tel ? opponentUser.user.telephone : null} opponentName={opponentUser.user.firstName + " " + opponentUser.user.lastName} key={`tomorrow-${trade._id.toString()}`} account={tradeUser.account.number} openDate={timeObject.date} openTime={timeObject.time} />;
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
