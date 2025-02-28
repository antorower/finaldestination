import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Settings from "@/models/Settings";
import Account from "@/models/Account";
import Trade from "@/models/Trade";

export async function GET() {
  await dbConnect();
  console.log("Ξεκινάει ο έλεγχος του trading");

  const greeceTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Athens" }));
  const greeceHour = greeceTime.getHours();

  // --> Η today αποθηκεύει την σημερινή ημέρα με πεζά γράμματα
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const todayNumber = new Date().getDay();
  const today = days[todayNumber];

  // --> Τραβάω τα settings
  const settings = await Settings.findOne();
  if (!settings) {
    console.log("Τα Settings δεν βρέθηκαν");
    return NextResponse.json({ stoped: true }, { status: 500 });
  }

  if (Number(greeceHour) !== settings.tradingHours.endingHour) {
    console.log("Η ώρα δεν είναι η σωστή: ", greeceHour);
    return NextResponse.json({ stoped: true }, { status: 200 });
  }

  // --> Αν η μέρα δεν είναι active σταματάει η διαδικασία
  if (!settings[today]?.active) {
    console.log("Η ημέρα δεν είναι active");
    return NextResponse.json({ stoped: true }, { status: 200 });
  }

  // --------------------------------------------------------------------------------------------------------

  const now = new Date();
  const todayStart = new Date(now.setUTCHours(0, 0, 0, 0));
  const todayEnd = new Date(todayStart);
  todayEnd.setUTCDate(todayStart.getUTCDate() + 1);

  const trades = await Trade.find({
    status: {
      $in: ["accepted", "openPending", "aware", "awarePending"],
    },
    openTime: { $gte: todayStart, $lt: todayEnd },
  }).populate([
    { path: "firstParticipant.user", select: "_id leader" },
    { path: "secondParticipant.user", select: "_id leader" },
  ]);

  const invoices = [];
  const userPenalties = {}; // Για συγκέντρωση των συνολικών ποινών/μπόνους ανά χρήστη
  const tradeUpdates = [];

  trades.forEach((trade) => {
    let tradeNote = `Trade #${trade._id}: `; // Κρατάμε αναλυτική περιγραφή

    ["firstParticipant", "secondParticipant"].forEach((participantKey) => {
      const participant = trade[participantKey];

      if (!participant.user) return;

      let penaltyAmount = 0;
      let category = "Mistake";
      let title = "";
      let description = "";
      let adminNote = "";

      // 🟥 CASE 1: Accepted -> Ποινή 30$
      if (participant.status === "accepted") {
        penaltyAmount = -30;
        title = "Missed Trade";
        description = `Ο χρήστης δήλωσε ότι θα βάλει το trade ${trade._id.toString()} και δεν το έβαλε. Ποινή 30$.`;
      }

      // 🟥 CASE 2: Aware -> Ποινή 100$
      if (participant.status === "aware") {
        penaltyAmount = -100;
        title = "Missed Trade";
        adminNote = "Πρέπει να χρεωθεί και την αξία του trade χειροκίνητα γιατί πάτησε aware αλλά δεν έβαλε το trade.";
        description = `Ο χρήστης δήλωσε ότι ήταν στον υπολογιστή την ώρα του trade ${trade._id.toString()} και τελικά δεν το έβαλε. Εκτός από τα 100$ που χρεώθηκε ήδη θα χρεωθεί και την αξία του trade χειροκίνητα. Ποινή 100$.`;
      }

      // 🟩 CASE 4: Open (Low Priority) -> Bonus 3
      if (participant.status === "open" && participant.priority === "low") {
        penaltyAmount = 3;
        category = "Bonus";
        title = "Low Priority Execution";
        description = "Ο χρήστης άνοιξε ένα low priority trade. Μπόνους +3.";
      }

      if (penaltyAmount !== 0) {
        const leader = participant?.user?.leader || null;

        invoices.push({
          user: participant.user._id,
          leader: leader,
          account: participant.account,
          trade: trade._id,
          title: title,
          description: description,
          category: category,
          amount: Math.abs(penaltyAmount),
          status: "Completed",
          adminNote: adminNote,
        });

        userPenalties[participant.user._id] = (userPenalties[participant.user._id] || 0) + penaltyAmount;

        tradeNote += ` [${participant.user._id}] ${title}: ${description} `;
      }
    });

    // Μαζεύουμε τα trades που πρέπει να γίνουν review
    tradeUpdates.push({
      updateOne: {
        filter: { _id: trade._id },
        update: { status: "review", note: tradeNote.trim() },
      },
    });
  });

  // Μαζική εισαγωγή invoices
  if (invoices.length > 0) await Invoice.insertMany(invoices);

  // Μαζικό update profits των χρηστών
  const userUpdates = Object.entries(userPenalties).map(([userId, amount]) => ({
    updateOne: {
      filter: { _id: userId },
      update: { $inc: { profits: amount } },
    },
  }));

  if (userUpdates.length > 0) await User.bulkWrite(userUpdates);

  // Μαζική ενημέρωση των trades σε status "review"
  if (tradeUpdates.length > 0) await Trade.bulkWrite(tradeUpdates);

  return NextResponse.json({ success: true });
}
