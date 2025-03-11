export const dynamic = "force-dynamic";

import InfoButton from "@/components/InfoButton";

const FinanceBar = ({ user }) => {
  // Your component logic here
  return (
    <div className="flex items-center px-4 py-2 bg-gray-50 justify-between rounded border border-gray-300 text-gray-600 text-sm">
      <div>Κέρδη: ${user.profits}</div>
      <div className="flex items-center gap-2">
        <div>Χρέος: ${user.dept}</div>
        <InfoButton classes="text-sm" message="Ο διαχειριστής έχει την δυνατότητα να μεταφέρει το κόστος ενός λάθους, ή μέρος αυτού, στον trader που το έκανε. Αυτό αφαιρείται άμεσα από τα κέρδη. Στην περίπτωση που δεν υπάρχουν όμως προστίθενται στο χρέος και αφαιρούνται από το μερίδιο του επόμενου payout μέχρι εξοφλήσεως." />
      </div>
      {user.share !== 0 && <div className="hidden sm:block"> Ποσοστό: {user.share}%</div>}
      {user.salary !== 0 && <div className="hidden sm:block"> Μισθός: ${user.salary}</div>}
    </div>
  );
};

export default FinanceBar;
