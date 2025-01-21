import AccountCard from "@/components/AccountCard";

export default function Home() {
  let publicNote = "";
  let personalNote = "";
  const dayOfWeek = new Date().getDay();

  // #UpdateData Notes
  switch (dayOfWeek) {
    case 1: // Δευτέρα
      publicNote = "Δευτέρα 20/1/2025: Κλείνουμε στις 5";
      break;
    case 2: // Τρίτη
      publicNote = "Τριτη 21/1/2025: Κλείνουμε στις 6";
      break;
    case 3: // Τετάρτη
      publicNote = "Τετάρτη 22/1/2025: Κλείνουμε στις 5";
      break;
    case 4: // Πέμπτη
      publicNote = "Πέμπτη 23/1/2025: Κλείνουμε στις 5";
      break;
    case 5: // Παρασκευή
      publicNote = "Παρασκευή 24/1/2025: Κλείνουμε στις 5";
      break;
    case 6: // Σάββατο
      publicNote = "Σάββατο 25/1/2025: Το market είναι κλειστό";
      break;
    case 0: // Κυριακή
      publicNote = "Κυριακή 26/1/2025: Το market είναι κλειστό";
      break;
    default:
      publicNote = "";
  }

  return (
    <div className="flex flex-col gap-4 p-8">
      {publicNote && publicNote !== "" && <div className="text-center p-4 bg-orange-700 w-full rounded-md animate-bounce text-lg font-bold">{publicNote}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AccountCard number="15485415" company="FTMO" balance={28500} phase={1} />
        <AccountCard number="15485415" company="Funded Next" balance={28500} phase={2} />
        <AccountCard number="15485415" company="FTMO" balance={28500} phase={3} />
        <AccountCard number="15485415" company="FTMO" balance={28500} phase={1} note="Βάλε 0.01" />
        <AccountCard number="15485415" company="FTMO" balance={28500} phase={1} />
        <AccountCard number="15485415" company="FTMO" balance={28500} phase={1} note="Βάλε 0.01" />
        <AccountCard number="15485415" company="FTMO" balance={28500} phase={1} />
        <AccountCard number="15485415" company="FTMO" balance={28500} phase={1} />
      </div>
    </div>
  );
}
