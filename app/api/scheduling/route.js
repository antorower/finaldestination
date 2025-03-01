import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Settings from "@/models/Settings";
import Trade from "@/models/Trade";
import Invoice from "@/models/Invoice";
import User from "@/models/User";

export async function GET() {
  await dbConnect();
  console.log("Ξεκινάει ο έλεγχος της αποδοχής των trades");
  // Αυτό τρέχει αμέσως μετά που θα έχουν αποδεχτούν οι users τα trades τους
  // Σκοπός είνα να δεί αν κάποια high priority trades έχουν γίνει cancel
  // Αν κάποιοι δεν έχουν κάνει καν τον κόπο να αποδεχτούν ή να απορρίψουν
  // Τέλος - Ελεγμένο

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

  if (Number(greeceHour) !== settings.acceptTradesHours.endingHour) {
    console.log("Η ώρα δεν είναι η σωστή: ", greeceHour);
    return NextResponse.json({ stoped: true }, { status: 200 });
  }

  // --> Αν η μέρα δεν είναι active σταματάει η διαδικασία
  if (!settings[today]?.active) {
    //console.log("Η ημέρα δεν είναι active");
    //return NextResponse.json({ stoped: true }, { status: 200 });
  }

  // --------------------------------------------------------------------------------------------------------
  const now = new Date();
  const todayStart = new Date(now.setUTCHours(0, 0, 0, 0));
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(todayStart.getUTCDate() + 1);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setUTCDate(tomorrowStart.getUTCDate() + 1);

  const trades = await Trade.find({
    status: "pending",
    openTime: { $gte: tomorrowStart, $lt: tomorrowEnd },
  })
    .populate([
      { path: "firstParticipant.user", select: "_id leader" },
      { path: "secondParticipant.user", select: "_id leader" },
    ])
    .lean();

  const invoices = [];
  const userPenalties = {};
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

      // Ακυρωμένο high priority
      if (participant.status === "canceled") {
        if (participant.priority === "high") {
          penaltyAmount = -20;
          title = "High Priority Ακυρωμένο";
          description = `Ο χρήστης ακύρωσε high priority trade. Χρέωση: 20$.`;
        }
      }

      // Μας έγραψε
      if (participant.status === "pending") {
        if (participant.priority === "high") {
          penaltyAmount = -50;
          title = "High Priority ξεχασμένο";
          description = `Ο χρήστης ούτε αποδέχτηκε ούτε απέρριψε high priority trade. Χρέωση 50$.`;
        }
        if (participant.priority === "low") {
          penaltyAmount = -5;
          title = "Low Priority Ξεχασμένο";
          description = `Ο χρήστης ούτε αποδέχτηκε ούτε απέρριψε low priority trade. Ποινή 5$.`;
        }
      }

      if (penaltyAmount !== 0) {
        invoices.push({
          user: participant.user._id,
          leader: participant?.user?.leader || null,
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

    if (trade.firstParticipant.status === "pending" || trade.firstParticipant.status === "canceled" || trade.secondParticipant.status === "pending" || trade.secondParticipant.status === "canceled") {
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
          update: { status: "accepted", note: tradeNote.trim() },
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
  if (tradeUpdates.length > 0) await Trade.bulkWrite(tradeUpdates);

  console.log("Ως εδώ φτάσαμε");
  return NextResponse.json({ success: true });
}
