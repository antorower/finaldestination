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
  if (!settings[today] || !settings[today].active) {
    console.log("Η ημέρα δεν είναι active");
    return NextResponse.json({ stoped: true }, { status: 200 });
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
  const userTotalProfits = {}; // Για συγκέντρωση των συνολικών ποινών/μπόνους ανά χρήστη
  const userPenaltiesCount = {};
  const userPenaltiesAmount = {};
  const userBonusesCount = {};
  const userBonusesAmount = {};
  const tradeUpdates = [];
  const acceptedTrades = {};
  const rejectedTrades = {};
  const forgetedTrades = {};

  trades.forEach((trade) => {
    let tradeNote = "";

    ["firstParticipant", "secondParticipant"].forEach((participantKey) => {
      const participant = trade[participantKey];

      if (!participant.user) return;

      let profitAmount = 0;
      let category = "Mistake";
      let title = "";
      let description = "";
      let adminNote = "";

      // Ακυρωμένο high priority
      if (participant.status === "canceled") {
        if (participant.priority === "high") {
          profitAmount = -20;
          title = "High Priority Ακυρωμένο";
          description = `Ο χρήστης ακύρωσε high priority trade. Χρέωση: 20$.`;
          if (!rejectedTrades[participant.user._id]) {
            rejectedTrades[participant.user._id] = {};
          }
          rejectedTrades[participant.user._id].highPriority = (rejectedTrades[participant.user._id].highPriority || 0) + 1;
        }
        if (participant.priority === "low") {
          if (!rejectedTrades[participant.user._id]) {
            rejectedTrades[participant.user._id] = {};
          }
          rejectedTrades[participant.user._id].lowPriority = (rejectedTrades[participant.user._id].lowPriority || 0) + 1;
        }
      }

      if (participant.status === "accepted") {
        if (participant.priority === "high") {
          if (!acceptedTrades[participant.user._id]) {
            acceptedTrades[participant.user._id] = {};
          }
          acceptedTrades[participant.user._id].highPriority = (acceptedTrades[participant.user._id].highPriority || 0) + 1;
        }
        if (participant.priority === "low") {
          if (!acceptedTrades[participant.user._id]) {
            acceptedTrades[participant.user._id] = {};
          }
          acceptedTrades[participant.user._id].lowPriority = (acceptedTrades[participant.user._id].lowPriority || 0) + 1;
        }
      }

      // Μας έγραψε
      if (participant.status === "pending") {
        if (participant.priority === "high") {
          profitAmount = -50;
          title = "High Priority ξεχασμένο";
          description = `Ο χρήστης ούτε αποδέχτηκε ούτε απέρριψε high priority trade. Χρέωση 50$.`;
        }
        if (participant.priority === "low") {
          profitAmount = -5;
          title = "Low Priority Ξεχασμένο";
          description = `Ο χρήστης ούτε αποδέχτηκε ούτε απέρριψε low priority trade. Ποινή 5$.`;
        }
        if (!forgetedTrades[participant.user._id]) {
          forgetedTrades[participant.user._id] = {};
        }
        forgetedTrades[participant.user._id].toAccept = (forgetedTrades[participant.user._id].toAccept || 0) + 1;
      }

      if (profitAmount !== 0) {
        invoices.push({
          user: participant.user._id,
          leader: participant?.user?.leader || null,
          account: participant.account,
          trade: trade._id,
          title: title,
          description: description,
          category: category,
          amount: Math.abs(profitAmount),
          status: "Completed",
          adminNote: adminNote,
        });

        userTotalProfits[participant.user._id] = (userTotalProfits[participant.user._id] || 0) + profitAmount;
        if (profitAmount < 0) {
          userPenaltiesCount[participant.user._id] = (userPenaltiesCount[participant.user._id] || 0) + 1;
          userPenaltiesAmount[participant.user._id] = (userPenaltiesAmount[participant.user._id] || 0) + Math.abs(profitAmount);
        }
        if (profitAmount > 0) {
          userBonusesCount[participant.user._id] = (userBonusesCount[participant.user._id] || 0) + 1;
          userBonusesAmount[participant.user._id] = (userBonusesAmount[participant.user._id] || 0) + profitAmount;
        }
        tradeNote += `${title}: ${description} `;
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
  const userUpdates = Object.entries(userTotalProfits).map(([userId, totalProfit]) => {
    const updateFields = { $inc: {} };

    if (totalProfit !== 0) {
      updateFields.$inc["profits"] = totalProfit;
    }

    const penaltyCount = userPenaltiesCount[userId] || 0;
    const penaltyAmount = userPenaltiesAmount[userId] || 0;
    const bonusCount = userBonusesCount[userId] || 0;
    const bonusAmount = userBonusesAmount[userId] || 0;
    const acceptedHighPriorityTrades = acceptedTrades[userId]?.highPriority || 0;
    const acceptedLowPriorityTrades = acceptedTrades[userId]?.lowPriority || 0;
    const rejectedHighPriorityTrades = rejectedTrades[userId]?.highPriority || 0;
    const rejectedLowPriorityTrades = rejectedTrades[userId]?.lowPriority || 0;
    const forgetedTradesToAccept = forgetedTrades[userId]?.toAccept || 0;

    if (acceptedHighPriorityTrades > 0) {
      updateFields.$inc["trades.accepted.highPriority"] = acceptedHighPriorityTrades;
    }
    if (acceptedLowPriorityTrades > 0) {
      updateFields.$inc["trades.accepted.lowPriority"] = acceptedLowPriorityTrades;
    }
    if (rejectedHighPriorityTrades > 0) {
      updateFields.$inc["trades.rejected.highPriority"] = rejectedHighPriorityTrades;
    }
    if (rejectedLowPriorityTrades > 0) {
      updateFields.$inc["trades.rejected.lowPriority"] = rejectedLowPriorityTrades;
    }
    if (forgetedTradesToAccept > 0) {
      updateFields.$inc["trades.forgeted.toAccept"] = forgetedTradesToAccept;
    }

    if (penaltyCount > 0) {
      updateFields.$inc["mistakes.withoutCost.count"] = penaltyCount;
      updateFields.$inc["mistakes.withoutCost.amount"] = penaltyAmount;
    }

    if (bonusCount > 0) {
      updateFields.$inc["bonuses.count"] = bonusCount;
      updateFields.$inc["bonuses.amount"] = bonusAmount;
    }

    if (Object.keys(updateFields.$inc).length === 0) {
      return null;
    }

    return {
      updateOne: {
        filter: { _id: userId },
        update: updateFields,
      },
    };
  });

  if (userUpdates.length > 0) await User.bulkWrite(userUpdates);
  if (tradeUpdates.length > 0) await Trade.bulkWrite(tradeUpdates);

  console.log("Ως εδώ φτάσαμε");
  return NextResponse.json({ success: true });
}
