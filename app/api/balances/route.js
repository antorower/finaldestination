import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Settings from "@/models/Settings";
import Account from "@/models/Account";
import Trade from "@/models/Trade";
import { revalidatePath } from "next/cache";
import Invoice from "@/models/Invoice";
import User from "@/models/User";

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
  if (!settings[today] || !settings[today].active) {
    console.log("Η ημέρα δεν είναι active");
    return NextResponse.json({ stoped: true }, { status: 200 });
  }

  // --------------------------------------------------------------------------------------------------------

  /*const now = new Date();
  const todayStart = new Date(now.setUTCHours(0, 0, 0, 0));
  const todayEnd = new Date(todayStart);
  todayEnd.setUTCDate(todayStart.getUTCDate() + 1);*/

  const trades = await Trade.find({ status: "open" }).populate([
    { path: "firstParticipant.user", select: "_id leader" },
    { path: "secondParticipant.user", select: "_id leader" },
  ]);

  if (trades.length === 0) {
    console.log("Δεν υπάρχουν trades για έλεγχο.");
    return NextResponse.json({ stoped: true }, { status: 200 });
  }

  const invoices = [];
  const userTotalProfits = {}; // Για συγκέντρωση των συνολικών ποινών/μπόνους ανά χρήστη
  const userPenaltiesCount = {};
  const userPenaltiesAmount = {};
  const userBonusesCount = {};
  const userBonusesAmount = {};
  const tradeUpdates = [];
  const forgetedTrades = {};
  const winTrades = {};
  const loseTrades = {};

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

      // 🟥 CASE 1: Δεν ενημερώθηκε το balance -> Ποινή 100$
      if (participant.status === "open") {
        profitAmount = -100;
        title = "Μη ενημερωμένο balance";
        description = `Ο χρήστης δεν έχει ενημερώσει το balance του ή/και δεν έχει κλείσει το trade του. Ποινή 100$.`;
        if (!forgetedTrades[participant.user._id]) {
          forgetedTrades[participant.user._id] = {};
        }
        forgetedTrades[participant.user._id].toUpdateBalance = (forgetedTrades[participant.user._id].toUpdateBalance || 0) + 1;
      }

      if (participant.profit) {
        if (participant.profit > 0) {
          winTrades[participant.user._id] = (winTrades[participant.user._id] || 0) + 1;
        }
        if (participant.profit < 0) {
          loseTrades[participant.user._id] = (loseTrades[participant.user._id] || 0) + 1;
        }
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

    let needReview = false;
    if (trade.firstParticipant.status === "open" || trade.secondParticipant.status === "open") {
      needReview = true;
    } else {
      if (trade.firstParticipant.profit < 0 && trade.secondParticipant.profit < 0) needReview = true;
      if (trade.firstParticipant.profit > 0 && trade.secondParticipant.profit > 0) needReview = true;
      if (trade.firstParticipant.profit > trade.firstParticipant.trade.takeProfit * 1.1) needReview = true;
      if (trade.firstParticipant.profit < 0 && Math.abs(trade.firstParticipant.profit) > trade.firstParticipant.trade.stopLoss * 1.15) needReview = true;
      if (trade.secondParticipant.profit > trade.secondParticipant.trade.takeProfit * 1.1) needReview = true;
      if (trade.secondParticipant.profit < 0 && Math.abs(trade.secondParticipant.profit) > trade.secondParticipant.trade.stopLoss * 1.15) needReview = true;
    }

    let totalProfit;
    if (typeof trade.firstParticipant.profit === "number" && typeof trade.secondParticipant.profit === "number") totalProfit = trade.firstParticipant.profit + trade.secondParticipant.profit;

    if (needReview) {
      tradeUpdates.push({
        updateOne: {
          filter: { _id: trade._id },
          update: { status: "review", note: tradeNote.trim(), profit: totalProfit || null },
        },
      });
    } else {
      tradeUpdates.push({
        updateOne: {
          filter: { _id: trade._id },
          update: { status: "completed", note: tradeNote.trim(), profit: totalProfit || null },
        },
      });
    }
  });

  // Μαζική εισαγωγή invoices
  if (invoices.length > 0) await Invoice.insertMany(invoices);

  // Μαζικό update profits των χρηστών και ενημέρωση των στατιστικών
  const userUpdates = Object.entries(userTotalProfits).map(([userId, totalProfit]) => {
    const updateFields = { $inc: {} };

    if (totalProfit !== 0) {
      updateFields.$inc["profits"] = totalProfit;
    }

    const penaltyCount = userPenaltiesCount[userId] || 0;
    const penaltyAmount = userPenaltiesAmount[userId] || 0;
    const bonusCount = userBonusesCount[userId] || 0;
    const bonusAmount = userBonusesAmount[userId] || 0;
    const winTradesCount = winTrades[userId] || 0;
    const loseTradesCount = loseTrades[userId] || 0;

    if (winTradesCount > 0) {
      updateFields.$inc["trades.win"] = winTradesCount;
    }

    if (loseTradesCount > 0) {
      updateFields.$inc["trades.lose"] = loseTradesCount;
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

  // Μαζική ενημέρωση των trades σε status "review"
  if (tradeUpdates.length > 0) await Trade.bulkWrite(tradeUpdates);

  revalidatePath("/", "layout");

  return NextResponse.json({ success: true });
}
