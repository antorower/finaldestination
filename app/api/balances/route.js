import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Settings from "@/models/Settings";
import Account from "@/models/Account";
import Trade from "@/models/Trade";

export async function GET() {
  await dbConnect();
  console.log("Ξεκινάει ο έλεγχος της αποδοχής των trades");
  // Αυτό τρέχει αμέσως μετά που θα έχουν αποδεχτούν οι users τα trades τους
  // Σκοπός είνα να δεί αν κάποια high priority trades έχουν γίνει cancel
  // Αν κάποιοι δεν έχουν κάνει καν τον κόπο να αποδεχτούν ή να απορρίψουν
  //Πρέπει να ελέγξω και τα balances

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

  if (Number(greeceHour) !== settings.updateBalanceHours.endingHour) {
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
    status: "open",
    openTime: { $gte: todayStart, $lt: todayEnd },
  }).populate([
    { path: "firstParticipant.user", select: "_id leader" },
    { path: "secondParticipant.user", select: "_id leader" },
  ]);

  const invoices = [];
  const userPenalties = {}; // Για συγκέντρωση των συνολικών ποινών/μπόνους ανά χρήστη
  const tradeUpdates = [];

  trades.forEach((trade) => {
    let tradeNote = "";

    ["firstParticipant", "secondParticipant"].forEach((participantKey) => {
      const participant = trade[participantKey];

      if (!participant.user) return;

      let penaltyAmount = 0;
      let category = "Mistake";
      let title = "";
      let description = "";
      let adminNote = "";

      // 🟥 CASE 1: Δεν ενημερώθηκε το balance -> Ποινή 100$
      if (participant.status === "open") {
        penaltyAmount = -100;
        title = "Μη ενημερωμένο balance";
        description = `Ο χρήστης δεν έχει ενημερώσει το balance του ή/και δεν έχει κλείσει το trade του. Ποινή 100$.`;
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

    let needReview = false;
    if (trade.firstParticipant.status === "open" || trade.secondParticipant.status === "open") {
      needReview = true;
    } else {
      if (trade.firstParticipant.profit < 0 && trade.secondParticipant.profit < 0) needReview = true;
      if (trade.firstParticipant.profit > 0 && trade.secondParticipant.profit > 0) needReview = true;
      if (trade.firstParticipant.profit > trade.firstParticipant.trade.takeProfit * 1.1) needReview = true;
      if (trade.firstParticipant.profit < 0 && Math.abs(trade.firstParticipant.profit) > trade.firstParticipant.trade.stopLoss * 1.1) needReview = true;
      if (trade.secondParticipant.profit > trade.secondParticipant.trade.takeProfit * 1.1) needReview = true;
      if (trade.secondParticipant.profit < 0 && Math.abs(trade.secondParticipant.profit) > trade.secondParticipant.trade.stopLoss * 1.1) needReview = true;
    }

    if (trade.firstParticipant.status === "open" || trade.secondParticipant.status === "open") {
      tradeUpdates.push({
        updateOne: {
          filter: { _id: trade._id },
          update: { status: "review", note: tradeNote.trim() },
        },
      });
    } else {
      tradeUpdates.push({
        updateOne: {
          filter: { _id: trade._id },
          update: { status: "completed", note: tradeNote.trim() },
        },
      });
    }
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
