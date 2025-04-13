export const dynamic = "force-dynamic";

import Image from "next/image";
import Step from "./Step";

const ScheduleBar = ({ GreeceTime, settings, user }) => {
  return (
    <div className="hidden md:grid grid-cols-11 text-sm border border-gray-300 p-4 bg-gray-50 rounded">
      <Step text="Trading" active={GreeceTime >= settings.tradingHours.startingHour && GreeceTime < settings.tradingHours.endingHour} startingHour={settings.tradingHours.startingHour + user.hourOffsetFromGreece} endingHour={settings.tradingHours.endingHour + user.hourOffsetFromGreece} info="Στην φάση του trading έρχεσαι στις εργασίες στο section Trading και βλέπεις τα trades που πρέπει να βάλεις" />
      <div className="flex flex-col items-center gap-2 self-center">
        <Image src="/right-arrow.svg" alt="" width={20} height={20} />
      </div>
      <Step
        text="Ενημέρωση"
        active={GreeceTime >= settings.updateBalanceHours.startingHour && GreeceTime < settings.updateBalanceHours.endingHour}
        startingHour={settings.updateBalanceHours.startingHour + user.hourOffsetFromGreece}
        endingHour={settings.updateBalanceHours.endingHour + user.hourOffsetFromGreece}
        info="Στην φάση της ενημέρωσης μπορείς να ενημερώσεις το balance των accounts σου όταν θα κλείσουν τα trades. Αν δεν κλείσουν μόνα τους θα πρέπει να τα κλείσεις εσύ την ώρα ακριβώς που αναγράφεται στο section Ενημέρωση στις εργασίες."
      />
      <div className="flex flex-col items-center gap-2 self-center">
        <Image src="/right-arrow.svg" alt="" width={20} height={20} />
      </div>
      <Step text="Προγραμματισμός" active={GreeceTime >= settings.acceptTradesHours.startingHour && GreeceTime < settings.acceptTradesHours.endingHour} startingHour={settings.acceptTradesHours.startingHour + user.hourOffsetFromGreece} endingHour={settings.acceptTradesHours.endingHour + user.hourOffsetFromGreece} info="Στην φάση του προγραμματισμού στο ομώνυμο section θα δεις τις προτάσεις του αλγόριθμου για να φτιάξεις το αυριανό πρόγραμμά σου." />
      <div className="flex flex-col items-center gap-2 self-center">
        <Image src="/right-arrow.svg" alt="" width={20} height={20} />
      </div>
      <Step text="Προετοιμασία" active={GreeceTime >= settings.seeScheduleHours.startingHour && GreeceTime < settings.seeScheduleHours.endingHour} startingHour={settings.seeScheduleHours.startingHour + user.hourOffsetFromGreece} endingHour={settings.seeScheduleHours.endingHour + user.hourOffsetFromGreece} info="Στην φάση της προετοιμασίας μπορείς να δεις τα trades που έχεις τελικά να βάλεις αύριο και τις ώρες του ώστε να βάλεις τα ξυπνητήρια σου την ώρα που πρέπει." />
    </div>
  );
};

export default ScheduleBar;
