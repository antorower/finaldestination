export const dynamic = "force-dynamic";

const StatsComponent = ({ user }) => {
  const allAccounts = user.allAccounts.phase1 + user.allAccounts.phase2 + user.allAccounts.phase3 + 15;
  const phase1 = user.allAccounts.phase1;
  const phase2 = user.allAccounts.phase2;
  const phase3 = user.allAccounts.phase3;

  // Υπολογίζουμε τα col-span βασισμένα στο ποσοστό επί 12
  let phase1ColSpan = Math.ceil(allAccounts > 0 ? (phase1 / allAccounts) * 12 : 4);
  let phase2ColSpan = Math.ceil(allAccounts > 0 ? (phase2 / allAccounts) * 12 : 4);
  let phase3ColSpan = Math.ceil(allAccounts > 0 ? (phase3 / allAccounts) * 12 : 4);

  // Εξασφαλίζουμε ότι το άθροισμα είναι ακριβώς 12
  let totalCols = phase1ColSpan + phase2ColSpan + phase3ColSpan;

  while (totalCols !== 12) {
    if (totalCols > 12) {
      if (phase1ColSpan > 1 && phase1ColSpan >= phase2ColSpan && phase1ColSpan >= phase3ColSpan) {
        phase1ColSpan--;
      } else if (phase2ColSpan > 1 && phase2ColSpan >= phase3ColSpan) {
        phase2ColSpan--;
      } else if (phase3ColSpan > 1) {
        phase3ColSpan--;
      }
    } else if (totalCols < 12) {
      if (phase1ColSpan <= phase2ColSpan && phase1ColSpan <= phase3ColSpan) {
        phase1ColSpan++;
      } else if (phase2ColSpan <= phase3ColSpan) {
        phase2ColSpan++;
      } else {
        phase3ColSpan++;
      }
    }
    totalCols = phase1ColSpan + phase2ColSpan + phase3ColSpan;
  }

  // Tailwind απαιτεί στατικές κλάσεις, οπότε χρησιμοποιούμε ένα αντικείμενο styles
  const styles = {
    phase1: `col-span-${phase1ColSpan}`,
    phase2: `col-span-${phase2ColSpan}`,
    phase3: `col-span-${phase3ColSpan}`,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-indigo-600 rounded p-4 text-white font-bold text-center text-2xl">Στατιστικά</div>
      <div className="flex flex-col gap-4">
        <div className="text-2xl text-gray-500 bg-gray-100 border rounded border-gray-300 p-4 text-center font-bold">All Accounts: {allAccounts}</div>
        <div className="grid grid-cols-12 text-white font-bold text-lg gap-4">
          <div className={`${styles.phase1} bg-blue-100 border border-blue-300 rounded text-gray-500 p-4 text-center`}>First Phase: {phase1}</div>
          <div className={`${styles.phase2} bg-violet-100 border border-violet-300 rounded text-gray-500 p-4 text-center`}>Second Phase: {phase2}</div>
          <div className={`${styles.phase3} bg-orange-100 border border-orange-300 rounded text-gray-500 p-4 text-center`}>Third Phase: {phase3}</div>
        </div>
      </div>
      <div>context</div>
    </div>
  );
};

export default StatsComponent;
