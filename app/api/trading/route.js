import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Settings from "@/models/Settings";
import Account from "@/models/Account";
import Trade from "@/models/Trade";
import Invoice from "@/models/Invoice";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

export async function GET() {
  await dbConnect();
  console.log("Ξεκινάει ο έλεγχος του trading");
  // Αυτό τρέχει ακριβώς μετά το άνοιγμα των trades
  // Για να δούμε αν κάποιος δεν άνοιξε τα trades του

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
  if (!settings[today] || !settings[today].active) {
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
      $in: ["accepted", "open"],
    },
    openTime: { $gte: todayStart, $lt: todayEnd },
  }).populate([
    { path: "firstParticipant.user", select: "_id leader" },
    { path: "secondParticipant.user", select: "_id leader" },
  ]);

  const invoices = [];
  const userTotalProfits = {};
  const userPenaltiesCount = {};
  const userPenaltiesAmount = {};
  const userBonusesCount = {};
  const userBonusesAmount = {};
  const tradeUpdates = [];
  const forgetedTrades = {};

  trades.forEach((trade) => {
    let tradeNote = ""; // Κρατάμε αναλυτική περιγραφή

    ["firstParticipant", "secondParticipant"].forEach((participantKey) => {
      const participant = trade[participantKey];

      if (!participant.user) return;
      if (participant.status === "try") return;

      let profitAmount = 0;
      let category = "Mistake";
      let title = "";
      let description = "";

      // 🟥 CASE: Accepted -> Ποινή 30$
      if (participant.status === "accepted") {
        profitAmount = -30;
        title = "Accepted Trade Ξεχάστηκε";
        description = `Ο χρήστης ξέχασε το trade του σήμερα.`;
        if (!forgetedTrades[participant.user._id]) {
          forgetedTrades[participant.user._id] = {};
        }
        forgetedTrades[participant.user._id].toOpen = (forgetedTrades[participant.user._id].toOpen || 0) + 1;
      }

      // 🟥 CASE: Accepted -> Ποινή 30$
      if (!participant.checked && participant.status === "open") {
        profitAmount = -15;
        title = "Δεν Έγινε Έλεγχος";
        description = `Ο χρήστης δεν έκανε έλεγχο αφού έβαλε το trade.`;
      }

      // 🟥 CASE: Aware -> Ποινή 100$
      if (participant.status === "aware") {
        profitAmount = -100;
        title = "Aware Trade Ξεχάστηκε";
        description = `Ο χρήστης δήλωσε ότι ήταν στον υπολογιστή την ώρα του trade και τελικά δεν το έβαλε.`;
        if (!forgetedTrades[participant.user._id]) {
          forgetedTrades[participant.user._id] = {};
        }
        forgetedTrades[participant.user._id].toOpen = (forgetedTrades[participant.user._id].toOpen || 0) + 1;
      }

      // 🟩 CASE: Open (Low Priority) -> Bonus 3
      if (participant.status === "open" && participant.priority === "low") {
        profitAmount = 5;
        category = "Bonus";
        title = "Low Priority Μπήκε";
        description = "Ο χρήστης άνοιξε ένα low priority trade και πήρε μπόνους.";
      }

      if (profitAmount !== 0) {
        const leader = participant?.user?.leader || null;

        invoices.push({
          user: participant.user._id,
          leader: leader,
          account: participant.account,
          trade: trade._id,
          title: title,
          description: description,
          category: category,
          amount: Math.abs(profitAmount),
          status: "Completed",
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

    if (trade.firstParticipant.status !== "open" || trade.secondParticipant.status !== "open") {
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
          update: { status: "open", note: tradeNote.trim() },
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
    const forgetedTradesToOpen = forgetedTrades[userId]?.toOpen || 0;

    if (penaltyCount > 0) {
      updateFields.$inc["mistakes.count"] = penaltyCount;
      updateFields.$inc["mistakes.amount"] = penaltyAmount;
    }

    if (bonusCount > 0) {
      updateFields.$inc["bonuses.count"] = bonusCount;
      updateFields.$inc["bonuses.amount"] = bonusAmount;
    }

    if (forgetedTradesToOpen > 0) {
      updateFields.$inc["trades.forgeted.toOpen"] = forgetedTradesToOpen;
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

  // Μαζική ενημέρωση των trades σε status "review"
  if (tradeUpdates.length > 0) await Trade.bulkWrite(tradeUpdates);
  revalidatePath("/", "layout");
  return NextResponse.json({ success: true });
}
