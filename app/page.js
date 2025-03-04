export const dynamic = "force-dynamic";

import PageTransition from "@/components/PageTransition";
import dbConnect from "@/dbConnect";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import ToggleActiveButton from "./ToggleActiveButton";
import { revalidatePath } from "next/cache";
import ScheduleForm from "./ScheduleForm";
import InfoButton from "@/components/InfoButton";
import ManageCompanies from "./ManageCompanies";
import Company from "@/models/Company";
import Link from "next/link";
import AccountsList from "./AccountsList";
import Image from "next/image";
import Settings from "@/models/Settings";
import Account from "@/models/Account";
import Step from "./Step";
import Trade from "@/models/Trade";
import TradeItem from "./TradeItem";
import { AddActivity } from "@/library/AddActivity";
import Explanation from "@/components/Explanation";
import OpenTradeItem from "./OpenTradeItem";
import Pair from "@/models/Pair";
import CloseTradeForm from "./CloseTradeForm";
import TomorrowTradeItem from "./TomorrowTradeItem";

const GetUser = async (id) => {
  await dbConnect();
  try {
    return await User.findById(id).populate("companies").populate("accounts").populate("leader").populate("family").populate("team").populate("beneficiaries");
  } catch (error) {
    console.log("Υπήρξε error στην GetUser στο root:", error);
    return false;
  }
};

const GetSettings = async (id) => {
  await dbConnect();
  try {
    return await Settings.findOne();
  } catch (error) {
    console.log("Υπήρξε error στην GetSettings στο root", error);
    return false;
  }
};

const ToggleStatus = async ({ id, status }) => {
  "use server";
  await dbConnect();
  try {
    await User.updateOne({ _id: id }, { $set: { status: status } });
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην ToogleActive στο root", error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const SaveSchedule = async ({ id, startingHour, endingHour }) => {
  "use server";
  try {
    console.log(startingHour + 1);
    console.log(endingHour + 1);
    if (Number(startingHour) >= Number(endingHour)) return { error: true, message: "Οι ώρες θα πρέπει να έχουνε λογική" };
    const tradingHours = { startingTradingHour: startingHour, endingTradingHour: endingHour };
    await dbConnect();
    await User.updateOne({ _id: id }, { $set: { tradingHours: tradingHours } });
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην SaveSchedule στο root", error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const ToggleFlexibleSuggestions = async ({ id, status }) => {
  "use server";
  try {
    await dbConnect();
    await User.updateOne({ _id: id }, { $set: { flexibleTradesSuggestions: status } });
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην ToggleFlexibleSuggestions στο root", error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const ChangeHourOffsetFromGreece = async ({ id, offset }) => {
  "use server";
  try {
    await dbConnect();
    await User.updateOne({ _id: id }, { $set: { hourOffsetFromGreece: offset } });
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην ChangeHourOffsetFromGreece στο root", error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const GetCompanies = async () => {
  "use server";
  try {
    await dbConnect();
    return await Company.find();
  } catch (error) {
    console.log(error);
    return { error: true, message: error.message };
  }
};

const GetTrades = async (userId) => {
  "use server";
  try {
    await dbConnect();
    return await Trade.find({
      $or: [
        { "firstParticipant.user": userId, "firstParticipant.status": { $ne: "closed" } },
        { "secondParticipant.user": userId, "secondParticipant.status": { $ne: "closed" } },
      ],
    })
      .populate("firstParticipant.user", "hourOffsetFromGreece")
      .populate("secondParticipant.user", "hourOffsetFromGreece")
      .populate("firstParticipant.account", "number balance phase")
      .populate("secondParticipant.account", "number balance phase")
      .lean();
  } catch (error) {
    console.log("Υπήρξε error στην GetTrades στο root ", error);
    return false;
  }
}; // να μην ειναι το γενικο review ή completed

const ChangeTradeStatus = async ({ tradeId, userId, status, accountId, priority }) => {
  "use server";
  try {
    await dbConnect();

    // Φέρνουμε τα settings
    const settings = await Settings.findOne();
    if (!settings) return { error: true, message: "Δεν βρέθηκαν ρυθμίσεις." };

    // Υπολογισμός της ώρας Ελλάδας
    const now = new Date();
    const greekOffset = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Athens", hour12: false, hour: "numeric" }).format(now);
    const greekHour = parseInt(greekOffset);

    // Έλεγχος αν η ώρα είναι μέσα στο acceptTradesHours
    const { startingHour, endingHour } = settings.acceptTradesHours;
    if (greekHour < startingHour || greekHour >= endingHour) {
      return { error: true, message: "Δεν μπορείτε να αποδεχτείτε ή απορρίψετε το trade αυτή τη στιγμή. Έχει παρέλθει η ώρα του προγραμματισμού." };
    }

    // Αλλαγή status του trade για τον user
    const trade = await Trade.findById(tradeId).populate("firstParticipant.account").populate("secondParticipant.account");

    if (!trade) return { error: true, message: "Δεν βρέθηκε το trade. Προσπάθησε ξανά." };
    if (trade.firstParticipant.user._id.toString() === userId) {
      trade.firstParticipant.status = status;
      trade.firstParticipant.account.note = status === "accepted" ? "Επερχόμενο Trade" : "";
      await trade.firstParticipant.account.save();
    }
    if (trade.secondParticipant.user._id.toString() === userId) {
      trade.secondParticipant.status = status;
      trade.secondParticipant.account.note = status === "accepted" ? "Επερχόμενο Trade" : "";
      await trade.secondParticipant.account.save();
    }
    await trade.save();

    // Εισαγωγή του activity
    let activityTitle;
    let activityDescription;
    let activitySign = "neutral";
    if (status === "accepted") {
      activityTitle = "Αποδοχή Trade";
      activityDescription = "Ο χρήστης αποδέχτηκε το trade";
      if (priority === "low") activitySign = "positive";
    }
    if (status === "canceled") {
      activityTitle = "Απόρριψη Trade";
      activityDescription = "Ο χρήστης απέρριψε το trade";
      if (priority === "high") activitySign = "negative";
    }
    await AddActivity({ user: userId, trade: tradeId, account: accountId, title: activityTitle, description: activityDescription, sign: activitySign });
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην ChangeTradeStatus στο root", error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const BeAwareOfTrade = async ({ tradeId, userId, accountId }) => {
  "use server";
  try {
    await dbConnect();

    const trade = await Trade.findById(tradeId);
    if (!trade) return { error: true, message: "Δεν βρέθηκε το trade. Προσπάθησε ξανά." };

    const nowUTC = new Date(); // Τρέχουσα UTC ώρα
    const openTimeUTC = new Date(trade.openTime); // Ώρα ανοίγματος trade (υποθέτουμε ότι είναι ήδη σε UTC)

    const tenMinutesBefore = new Date(openTimeUTC.getTime() - 10 * 60 * 1000); // 10 λεπτά πριν
    const oneHourBefore = new Date(openTimeUTC.getTime() - 60 * 60 * 1000); // 1 ώρα πριν
    console.log(oneHourBefore);
    if (nowUTC < oneHourBefore || nowUTC > tenMinutesBefore) return { error: true, message: "Δεν μπορείς να δηλώσεις παρών για αυτό το trade αυτήν την ώρα." };

    if (trade.firstParticipant.user._id.toString() === userId) {
      trade.firstParticipant.status = "aware";
    }
    if (trade.secondParticipant.user._id.toString() === userId) {
      trade.secondParticipant.status = "aware";
    }
    await trade.save();

    const activityTitle = "Δήλωση Παρουσίας";
    const activityDescription = "Ο χρήστης δήλωσε ότι είναι παρών για το επερχόμενο trade";
    const activitySign = "neutral";
    await AddActivity({ user: userId, trade: tradeId, account: accountId, title: activityTitle, activitySign, description: activityDescription });
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε ένα πρόβλημα στην BeAwareOfTrade στο root", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const OpenTrade = async ({ tradeId, userId, accountId }) => {
  "use server";
  try {
    console.log(tradeId);
    console.log(userId);
    console.log(accountId);
    await dbConnect();

    // Το trade που προσπαθούμε να ανοίξουμε
    let currentTrade = await Trade.findById(tradeId)
      .populate({ path: "firstParticipant.account", populate: { path: "company" } })
      .populate({ path: "secondParticipant.account", populate: { path: "company" } });

    if (!currentTrade) return { error: true, message: "Το trade δεν βρέθηκε." };

    // Παίρνουμε την τρέχουσα UTC ώρα
    const nowUTC = new Date();

    // Παίρνουμε την UTC ώρα του openTime του trade
    const openTimeUTC = new Date(currentTrade.openTime);

    // Υπολογίζουμε 10 λεπτά πριν από το openTime
    const tenMinutesBefore = new Date(openTimeUTC.getTime() - 10 * 60 * 1000);

    // Έλεγχος αν η τρέχουσα ώρα είναι μεταξύ 10 λεπτών και ακριβώς πριν το openTime

    if (nowUTC < tenMinutesBefore) return { error: true, message: "Πάτησε Open Trade 7 με 10 λεπτά πριν την ώρα του trade." };
    if (nowUTC > openTimeUTC) return { error: true, message: "Δυτυχώς η ώρα πέρασε. Δεν μπορείς να βάλεις trade τώρα και αυτό δεν πρέπει να ξαναγίνει!" };

    // Ελέγχω αν και οι δύο traders έχουν δηλώσει το παρών
    if (currentTrade.firstParticipant.user.toString() === userId) {
      if (currentTrade.secondParticipant.status === "accepted") {
        currentTrade.firstParticipant.status = "try";
        await currentTrade.save();
        const activityTitle = "Προσπάθεια ανοίγματος trade";
        const activityDescription = "Ο χρήστης προσπάθησε να τραβήξει trade αλλά το trade ακυρώθηκε.";
        const activitySign = "neutral";
        await AddActivity({ user: userId, trade: tradeId, account: accountId, title: activityTitle, activitySign, description: activityDescription });
        return { error: true, message: "Το trade ακυρώθηκε" };
      }
    }
    if (currentTrade.secondParticipant.user.toString() === userId) {
      if (currentTrade.firstParticipant.status === "accepted") {
        currentTrade.secondParticipant.status = "try";
        await currentTrade.save();
        const activityTitle = "Προσπάθεια ανοίγματος trade";
        const activityDescription = "Ο χρήστης προσπάθησε να τραβήξει trade αλλά το trade ακυρώθηκε.";
        const activitySign = "neutral";
        await AddActivity({ user: userId, trade: tradeId, account: accountId, title: activityTitle, activitySign, description: activityDescription });
        return { error: true, message: "Το trade ακυρώθηκε" };
      }
    }

    // Εντοπισμός του σωστού participant και αλλαγή του status του σε "open" αν υπάρχει ήδη trade
    if (currentTrade.firstParticipant.user.toString() === userId && currentTrade.firstParticipant?.trade?.pair) {
      currentTrade.firstParticipant.status = "open";
      currentTrade.firstParticipant.account.needBalanceUpdate = true;
      currentTrade.firstParticipant.account.note = "Ενημέρωσε Balance";
      await currentTrade.firstParticipant.account.save();
      await currentTrade.save();

      const activityTitle = "'Ανοιγμα Trade";
      const activityDescription = "Ο χρήστης τράβηξε το trade από την σελίδα.";
      const activitySign = "neutral";
      await AddActivity({ user: userId, trade: tradeId, account: accountId, title: activityTitle, activitySign, description: activityDescription });
      return { error: false, message: "Το trade σου άνοιξε επιτυχώς." };
    }

    if (currentTrade.secondParticipant.user.toString() === userId && currentTrade.secondParticipant?.trade?.pair) {
      currentTrade.secondParticipant.status = "open";
      currentTrade.secondParticipant.account.needBalanceUpdate = true;
      currentTrade.secondParticipant.account.note = "Ενημέρωσε Balance";
      await currentTrade.secondParticipant.account.save();
      await currentTrade.save();

      const activityTitle = "'Ανοιγμα Trade";
      const activityDescription = "Ο χρήστης τράβηξε το trade από την σελίδα.";
      const activitySign = "neutral";
      await AddActivity({ user: userId, trade: tradeId, account: accountId, title: activityTitle, activitySign, description: activityDescription });

      return { error: false, message: "Το trade σου άνοιξε επιτυχώς." };
    }

    // Υπολογίζουμε το χρονικό όριο (40 λεπτά πριν)
    const fortyMinutesAgo = new Date(Date.now() - 40 * 60 * 1000);

    // Παίρνουμε όλα τα trades που είναι accepted ή open και έχουν openTime μέσα στα τελευταία 40 λεπτά
    const allTrades = await Trade.find({
      status: { $in: ["accepted", "open"] },
      openTime: { $gte: fortyMinutesAgo },
    })
      .populate("firstParticipant.account")
      .populate("secondParticipant.account");

    // Παίρνουμε τα settings ολόκληρα για να τα χρησιμοποιήσουμε αργότερα
    const settings = await Settings.findOne().populate("monday.pairs tuesday.pairs wednesday.pairs thursday.pairs friday.pairs");

    const today = new Date().toLocaleString("en-us", { weekday: "long" }).toLowerCase();
    const todaySettings = settings[today];

    if (!todaySettings?.active) {
      // return { error: true, message: "Οι συναλλαγές δεν είναι ενεργές για σήμερα." }; EDIT
    }

    // Όλα τα διαθέσιμα pairs από τα settings της ημέρας
    //let availablePairs = todaySettings.pairs;
    let availablePairs = await Pair.find();

    // IDs των εταιρειών των συμμετεχόντων
    const firstCompanyId = currentTrade.firstParticipant.account.company._id.toString();
    const secondCompanyId = currentTrade.secondParticipant.account.company._id.toString();

    // Βρίσκουμε τα ήδη χρησιμοποιημένα pairs για κάθε εταιρεία
    let usedPairsByFirstCompany = new Set();
    let usedPairsBySecondCompany = new Set();

    allTrades.forEach((trade) => {
      if (trade.firstParticipant.account?.company?._id.toString() === firstCompanyId) {
        usedPairsByFirstCompany.add(trade.firstParticipant.trade?.pair);
      }
      if (trade.secondParticipant.account?.company?._id.toString() === secondCompanyId) {
        usedPairsBySecondCompany.add(trade.secondParticipant.trade?.pair);
      }
    });

    // Επιπλέον, ελέγχουμε αν ο χρήστης έχει ήδη ανοίξει trade σήμερα στην ίδια εταιρεία
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const userTradesToday = await Trade.find({
      $or: [{ "firstParticipant.user": userId }, { "secondParticipant.user": userId }],
      openTime: { $gte: todayStart },
    }).populate("firstParticipant.account secondParticipant.account");

    if (userTradesToday && userTradesToday.length > 0) {
      userTradesToday.forEach((trade) => {
        if (trade.firstParticipant.account?.company?.equals(firstCompanyId)) {
          usedPairsByFirstCompany.add(trade.firstParticipant.trade?.pair);
        }
        if (trade.secondParticipant.account?.company?.equals(secondCompanyId)) {
          usedPairsBySecondCompany.add(trade.secondParticipant.trade?.pair);
        }
      });
    }

    // Φιλτράρουμε τα διαθέσιμα pairs ώστε να μην περιέχουν αυτά που έχουν ήδη χρησιμοποιηθεί
    let filteredPairsFirstCompany = availablePairs.filter((pair) => pair && !usedPairsByFirstCompany.has(pair.name));
    let filteredPairsSecondCompany = availablePairs.filter((pair) => pair && !usedPairsBySecondCompany.has(pair.name));

    // Ταξινόμηση των pairs με βάση το priority (ascending)
    let sortedPairs = [...filteredPairsFirstCompany, ...filteredPairsSecondCompany].sort((a, b) => b.priority - a.priority);

    // Βρίσκουμε το κοινό pair με το χαμηλότερο priority
    let bestPair = null;
    sortedPairs.forEach((pair) => {
      if (filteredPairsFirstCompany.some((p) => p.name === pair.name) && filteredPairsSecondCompany.some((p) => p.name === pair.name)) {
        bestPair = pair;
        return;
      }
    });

    if (!bestPair) {
      return { error: true, message: "Δεν υπάρχουν διαθέσιμα pairs για αυτό το trade." };
    }

    const firstParticipantAccount = currentTrade.firstParticipant.account;
    let firstParticipantPhase;
    if (firstParticipantAccount.phase === 1) firstParticipantPhase = "phase1";
    if (firstParticipantAccount.phase === 2) firstParticipantPhase = "phase2";
    if (firstParticipantAccount.phase === 3) firstParticipantPhase = "phase3";
    const firstParticipantRemainingProfit = (firstParticipantAccount.capital * firstParticipantAccount.company[firstParticipantPhase].target) / 100;
    const firstParticipantRemainingLoss = (firstParticipantAccount.capital * firstParticipantAccount.company[firstParticipantPhase].totalDrawdown) / 100;
    const firstParticipantMaxLoss = (firstParticipantAccount.company[firstParticipantPhase].maxRiskPerTrade * firstParticipantAccount.capital) / 100;

    const secondParticipantAccount = currentTrade.secondParticipant.account;
    let secondParticipantPhase;
    if (secondParticipantAccount.phase === 1) secondParticipantPhase = "phase1";
    if (secondParticipantAccount.phase === 2) secondParticipantPhase = "phase2";
    if (secondParticipantAccount.phase === 3) secondParticipantPhase = "phase3";
    const secondParticipantRemainingProfit = (secondParticipantAccount.capital * secondParticipantAccount.company[secondParticipantPhase].target) / 100;
    const secondParticipantRemainingLoss = (secondParticipantAccount.capital * secondParticipantAccount.company[secondParticipantPhase].totalDrawdown) / 100;
    const secondParticipantMaxLoss = (secondParticipantAccount.company[secondParticipantPhase].maxRiskPerTrade * secondParticipantAccount.capital) / 100;

    let firstTakeProfit;
    let secondTakeProfit;
    let firstStopLoss;
    let secondStopLoss;
    //
    let firstCost = false;
    let secondCost = false;

    let firstGapTp = true;
    let firstGapSl = true;
    let secondGapTp = true;
    let secondGapSl = true;

    if (firstParticipantRemainingProfit < secondParticipantMaxLoss) {
      firstTakeProfit = firstParticipantRemainingProfit;
      secondStopLoss = firstTakeProfit;
      firstCost = true;
      firstGapTp = false;
    }
    if (secondParticipantRemainingProfit < firstParticipantMaxLoss) {
      secondTakeProfit = secondParticipantRemainingProfit;
      firstStopLoss = secondTakeProfit;
      secondCost = true;
      secondGapTp = false;
    }

    if (firstParticipantRemainingLoss < secondParticipantMaxLoss) {
      firstStopLoss = firstParticipantRemainingLoss;
      secondTakeProfit = firstStopLoss;
      firstGapSl = false;
    }
    if (secondParticipantRemainingLoss < firstParticipantMaxLoss) {
      secondStopLoss = secondParticipantRemainingLoss;
      firstTakeProfit = secondStopLoss;
      secondGapSl = false;
    }

    if (firstParticipantRemainingProfit >= secondParticipantMaxLoss && firstParticipantRemainingLoss >= secondParticipantMaxLoss) {
      firstTakeProfit = Math.random() * (secondParticipantMaxLoss - secondParticipantMaxLoss * 0.8) + secondParticipantMaxLoss * 0.8;
      secondStopLoss = firstTakeProfit;
    }
    if (secondParticipantRemainingProfit >= firstParticipantMaxLoss && secondParticipantRemainingLoss >= firstParticipantMaxLoss) {
      secondTakeProfit = Math.random() * (firstParticipantMaxLoss - firstParticipantMaxLoss * 0.8) + firstParticipantMaxLoss * 0.8;
      firstStopLoss = secondTakeProfit;
    }

    // Τυχαία επιλογή Buy/Sell
    const firstPosition = Math.random() < 0.5 ? "Buy" : "Sell";
    const secondPosition = firstPosition === "Buy" ? "Sell" : "Buy";

    const minimumProfit = Math.min(firstTakeProfit, secondTakeProfit);
    let lots = (bestPair.lots * minimumProfit) / 1000;

    if (currentTrade.firstParticipant.account.company.maxLots < lots || currentTrade.secondParticipant.account.company.maxLots < lots) {
      const maxLots = Math.min(currentTrade.firstParticipant.account.company.maxLots, currentTrade.secondParticipant.account.company.maxLots);
      lots = Math.random() * (maxLots * 0.99 - maxLots * 0.9) + maxLots * 0.9;
    }

    if (firstCost) firstTakeProfit = firstTakeProfit + bestPair.costFactor * lots;
    if (secondCost) secondTakeProfit = secondTakeProfit + bestPair.costFactor * lots;

    if (firstGapTp) {
      firstTakeProfit = firstTakeProfit - settings.targetsGap[firstParticipantPhase] * lots;
    } else {
      firstStopLoss = firstStopLoss + settings.targetsGap[firstParticipantPhase] * lots;
    }
    if (secondGapTp) {
      secondTakeProfit = secondTakeProfit - settings.targetsGap[firstParticipantPhase] * lots;
    } else {
      secondStopLoss = secondStopLoss + settings.targetsGap[firstParticipantPhase] * lots;
    }

    // Ανάθεση στο currentTrade
    currentTrade.firstParticipant.trade = {
      pair: bestPair.name, // Θα πρέπει να οριστεί
      lots: lots - 0.01, // Θα πρέπει να οριστεί
      position: firstPosition,
      takeProfit: Math.floor(firstTakeProfit),
      stopLoss: Math.floor(firstStopLoss),
    };

    currentTrade.secondParticipant.trade = {
      pair: bestPair.name, // Θα πρέπει να οριστεί
      lots: lots - (Math.random() * (0.11 - 0.05) + 0.05),
      position: secondPosition,
      takeProfit: Math.floor(secondTakeProfit),
      stopLoss: Math.floor(secondStopLoss),
    };

    if (currentTrade.firstParticipant.user.toString() === userId && currentTrade.firstParticipant?.trade?.pair) {
      currentTrade.firstParticipant.status = "open";
      currentTrade.firstParticipant.account.needBalanceUpdate = true;
      currentTrade.firstParticipant.account.note = "Ενημέρωσε Balance";
      await currentTrade.firstParticipant.account.save();
    }
    if (currentTrade.secondParticipant.user.toString() === userId && currentTrade.secondParticipant?.trade?.pair) {
      currentTrade.secondParticipant.status = "open";
      currentTrade.secondParticipant.account.needBalanceUpdate = true;
      currentTrade.secondParticipant.account.note = "Ενημέρωσε Balance";
      await currentTrade.secondParticipant.account.save();
    }

    const activityTitle = "'Ανοιγμα Trade";
    const activityDescription = "Ο χρήστης τράβηξε το trade από την σελίδα.";
    const activitySign = "neutral";
    await AddActivity({ user: userId, trade: tradeId, account: accountId, title: activityTitle, activitySign, description: activityDescription });

    await currentTrade.save();
    return { error: false, message: "Το trade σου άνοιξε επιτυχώς." };
  } catch (error) {
    console.log("Υπήρξε ένα error στην OpenTrade στο root", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const TradeChecked = async ({ tradeId, userId, accountId }) => {
  "use server";
  try {
    await dbConnect();

    let trade = await Trade.findById(tradeId);
    if (!trade) return { error: true, message: "Το trade δεν βρέθηκε." };

    if (trade.firstParticipant.user._id.toString() === userId) {
      trade.firstParticipant.checked = true;
      await trade.save();
    }
    if (trade.secondParticipant.user._id.toString() === userId) {
      trade.secondParticipant.checked = true;
      await trade.save();
    }

    const activityTitle = "Το trade ελέχθηκε";
    const activityDescription = "Ο χρήστης έχει ελέγξει το trade.";
    const activitySign = "neutral";
    await AddActivity({ user: userId, trade: tradeId, account: accountId, title: activityTitle, activitySign, description: activityDescription });

    return { error: false, message: "Η διαδικασία ολοκληρώθηκε επιτυχώς!" };
  } catch (error) {
    console.log(error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const UpdateBalance = async ({ tradeId, userId, newBalance }) => {
  "use server";

  try {
    await dbConnect();
    const trade = await Trade.findById(tradeId).populate("firstParticipant.account").populate("secondParticipant.account");
    if (!trade) return { error: true, message: "Δεν βρέθηκε το trade. Προσπάθησε ξανά." };
    let targetedAccount;
    let oldBalance;
    if (trade.firstParticipant.user._id.toString() === userId) {
      trade.firstParticipant.status = "closed";
      oldBalance = trade.firstParticipant.account.balance;
      trade.firstParticipant.profit = newBalance - trade.firstParticipant.account.balance;
      targetedAccount = trade.firstParticipant.account;
      await trade.firstParticipant.account.updateBalance(newBalance, trade.firstParticipant.trade.takeProfit, trade.firstParticipant.trade.stopLoss);
    }
    if (trade.secondParticipant.user._id.toString() === userId) {
      trade.secondParticipant.status = "closed";
      oldBalance = trade.secondParticipant.account.balance;
      trade.secondParticipant.profit = newBalance - trade.secondParticipant.account.balance;
      targetedAccount = trade.secondParticipant.account;
      await trade.secondParticipant.account.updateBalance(newBalance, trade.secondParticipant.trade.takeProfit, trade.secondParticipant.trade.stopLoss);
    }
    await trade.save();

    await AddActivity({ user: userId, account: targetedAccount?._id.toString(), trade: tradeId, title: `Ο χρήστης ενημέρωσε το balance του account ${targetedAccount?.number} από $${oldBalance} σε $${newBalance}` });

    return { error: false, message: "Το balance σου ενημερώθηκε επιτυχώς!" };
  } catch (error) {
    console.log("Υπήρξε ένα πρόβλημα στην UpdateBalance στο root", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

export default async function Home({ searchParams }) {
  const { sessionClaims } = await auth();
  const { mode, userid, accountcheck, tradecheck } = await searchParams;

  const user = await GetUser(userid ? userid : sessionClaims.metadata.mongoId);
  if (!user) return <div>Δεν βρέθηκε χρήστης</div>;
  const trades = await GetTrades(user._id.toString());

  const forOpening = [];
  const openTrades = [];
  const tradeSuggestions = [];
  if (trades && trades.length > 0) {
    trades.forEach((trade) => {
      let participant = null;
      // Βρίσκουμε αν ο χρήστης είναι first ή second participant
      if (trade.firstParticipant?.user?._id.toString() === user._id.toString()) {
        participant = trade.firstParticipant;
      } else if (trade.secondParticipant?.user?._id.toString() === user._id.toString()) {
        participant = trade.secondParticipant;
      }
      // Αν δεν βρέθηκε participant, προχωράμε στο επόμενο trade
      if (!participant) return;

      // 1️⃣ tradeSuggestions → (Participant: pending, accepted, canceled) & (Trade: pending)
      if (["pending", "accepted", "canceled"].includes(participant.status) && trade.status === "pending") {
        tradeSuggestions.push(trade);
      }

      // 2️⃣ forOpening → (Trade: accepted)
      if (trade.status === "accepted") {
        forOpening.push(trade);
      }

      // 3️⃣ openTrades → (Participant: open)
      if (participant.status === "open") {
        openTrades.push(trade);
      }
    });
  }

  const settings = await GetSettings();
  const companies = await GetCompanies();

  if (!user || !settings) return <div className="flex justify-center animate-pulse text-gray-700">Κάτι πήγε στραβά. Κάνε refresh.</div>;

  const status = user.status;
  const id = user._id.toString();

  const GreeceTime = Number(new Date().toLocaleString("en-US", { timeZone: "Europe/Athens", hour: "numeric", hour12: false }));

  return (
    <PageTransition>
      <div className="flex flex-col gap-4">
        <div className={`${status === "active" ? "bg-blue-500" : "bg-red-500"} rounded flex justify-center items-center p-4 gap-4 transition-colors duration-300`}>
          <ToggleActiveButton ToggleStatus={ToggleStatus} id={id} status={status} />
          <Link href="/" className="sm:text-xl text-white text-center text-sm font-black">
            {user.firstName.toUpperCase()} {user.lastName.toUpperCase()}
          </Link>
          <InfoButton classes="text-base" message="Πατώντας το στρογγυλό κουμπί στα αριστερά μπορείς να αλλάξεις το status σου. Αν είσαι κόκκινος σημαίνει ότι ο αλγόριθμος από εδω και πέρα δεν θα σε συμπεριλαμβάνει στα trades της επόμενης ημέρας" />
        </div>

        <div className="flex items-center px-4 py-2 bg-gray-50 justify-between rounded border border-gray-300 text-gray-600 text-sm">
          <div>Κέρδη: ${user.profits}</div>
          <div className="flex items-center gap-2">
            <div>Χρέος: ${user.dept}</div>
            <InfoButton classes="text-sm" message="Ο διαχειριστής έχει την δυνατότητα να μεταφέρει το κόστος ενός λάθους, ή μέρος αυτού, στον trader που το έκανε. Αυτό αφαιρείται άμεσα από τα κέρδη. Στην περίπτωση που δεν υπάρχουν όμως προστίθενται στο χρέος και αφαιρούνται από το μερίδιο του επόμενου payout μέχρι εξοφλήσεως." />
          </div>
          {user.salary !== 0 && <div> Μισθός: ${user.salary}/μήνα</div>}
          {user.share == 0 && <div className="hidden sm:block"> Ποσοστό: {user.salary}%</div>}
        </div>

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

        <div className="grid grid-cols-12 gap-4">
          <div className="flex flex-col gap-4 col-span-12 md:col-span-3 xl:col-span-2">
            <div className="p-4 flex w-full flex-row flex-wrap justify-between lg:flex-col gap-4 border h-auto md:h-[230px] border-gray-300 rounded">
              <MenuItem link={`/${userid ? `?userid=${userid}` : ""}`} name="Εργασίες" icon="task.svg" size={18} />
              <MenuItem link={`/?mode=accounts${userid ? `&userid=${userid}` : ""}`} name="Accounts" icon="account.svg" size={18} />
              <MenuItem link={`/?mode=tradingsettings${userid ? `&userid=${userid}` : ""}`} name="Ρυθμίσεις" icon="/settings-icon.svg" size={18} />
              <MenuItem link={`/?mode=tickets${userid ? `&userid=${userid}` : ""}`} name="Tickets" icon="/tickets.svg" size={18} />
              <MenuItem link={`/?mode=companies${userid ? `&userid=${userid}` : ""}`} name="Εταιρίες" icon="/company-icon.svg" size={18} info="Πάτησε πάνω και ενεργοποίησε όποιες εταιρείες θέλεις να παίζεις. Αν κάποια εταιρεία δεν θέλεις να την παίζεις απλά απενεργοποίησε την." />{" "}
            </div>
          </div>
          <div className="col-span-12 md:col-span-9 xl:col-span-10 px-4 overflow-y-auto">
            {!mode && (
              <div className="flex flex-col gap-4">
                {/* Trading */}
                {GreeceTime >= settings.tradingHours.startingHour - 1 && GreeceTime < settings.tradingHours.endingHour && (
                  <div className="flex flex-col gap-4">
                    <div className="font-semibold">Trading</div>
                    <div className="flex flex-col gap-2">
                      <Explanation
                        text={`Κάθε μέρα από τις ${user.tradingHours.startingTradingHour + user.hourOffsetFromGreece}:00 έως τις ${
                          user.tradingHours.endingTradingHour + user.hourOffsetFromGreece
                        }:00 πρέπει να βάλεις τα trades σου ακριβώς την ώρα που γράφει στο κάθε ένα. Μια ώρα με 10 λεπτά πριν την ώρα που πρέπει να ανοίξει το trade πρέπει να πατήσεις Aware και 7 με 10 λεπτά πριν την ώρα που πρέπει να ανοίξει το trade πρέπει να πατήσεις Open Trade και να προετοιμάσεις το trade σου ώστε να ανοίξει ακριβώς την ώρα που γράφει. Μπορείς να αλλάξεις τα trading ωράρια σου από τις ρυθμίσεις. Επίσης στις ρυθμίσεις μπορείς να βάλεις την διαφορά ώρας που έχεις με την Ελλάδα ώστε οι ώρες που θα βλέπεις στην σελίδα να ταιριάζουν με την τοπική σου. Θυμήσου ότι για να πατήσεις Aware θα πρέπει να είσαι σίγουρος ότι μπορείς να κάνεις login στο account σου και το account μπορεί να δεχτεί trades. Αν δεν είσαι σίγουρος για αυτά τα δύο αργά ή γρήγορα θα έρθει η ώρα που θα έχεις 5-6 λεπτά να βάλεις το trade και δεν θα μπορείς να μπεις στο account ή το account δεν θα είναι έτοιμο να δεχτεί trade ενώ εσύ το έχεις τραβήξει. Αυτό σημαίνει ότι θα χρεωθείς το λάθος αυτόματα, από 100$ μέχρι και 1600$ ανάλογα την περίπτωση.`}
                        lettersShow={50}
                        classes="text-gray-400 text-sm"
                      />
                      <div className="text-sm text-gray-400 flex items-center gap-1">
                        <div>Πήγαινε στις ρυθμίσες:</div>
                        <Link href="/?mode=tradingsettings" className="text-blue-400 hover:underline">
                          Αλλαγή ωραρίων
                        </Link>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      {forOpening &&
                        forOpening.length > 0 &&
                        forOpening.map((trade) => {
                          // Μετατροπή ξανά σε Date object για να προσθέσουμε το hourOffsetFromGreece
                          const greeceDateObject = new Date(trade.openTime);
                          // Δημιουργούμε το τελικό Date object με το σωστό offset
                          greeceDateObject.setHours(greeceDateObject.getHours() + user.hourOffsetFromGreece);
                          const formattedDate = greeceDateObject.toLocaleDateString("el-GR", {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          });
                          const formattedTime = greeceDateObject.toLocaleTimeString("el-GR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          });

                          let tradeUser;
                          if (trade.firstParticipant.user._id.toString() === user._id.toString()) tradeUser = trade.firstParticipant;
                          if (trade.secondParticipant.user._id.toString() === user._id.toString()) tradeUser = trade.secondParticipant;
                          return (
                            <OpenTradeItem
                              BeAwareOfTrade={BeAwareOfTrade}
                              OpenTrade={OpenTrade}
                              tradeId={trade._id.toString()}
                              userId={tradeUser.user._id.toString()}
                              key={`trading-${trade._id.toString()}`}
                              account={tradeUser.account.number}
                              accountId={tradeUser.account._id.toString()}
                              priority={tradeUser.priority}
                              openDate={formattedDate}
                              openTime={formattedTime}
                              status={tradeUser.status}
                              checked={tradeUser.checked}
                              accountCheck={accountcheck === "true" ? true : false}
                              tradeCheck={tradecheck === "true" ? true : false}
                              trade={tradeUser.trade}
                              TradeChecked={TradeChecked}
                            />
                          );
                        })}
                    </div>
                  </div>
                )}
                {/* Ενημέρωση */}
                {GreeceTime >= settings.updateBalanceHours.startingHour && GreeceTime < settings.updateBalanceHours.endingHour && (
                  <div className="flex flex-col gap-4">
                    <div className="font-semibold">Ενημέρωση</div>
                    <div className="flex flex-col gap-1">
                      <Explanation text={`Η φάση της ενημέρωσης είναι ενεργή κάθε μέρα από τις ${settings.updateBalanceHours.startingHour + user.hourOffsetFromGreece}:00 έως τις ${settings.updateBalanceHours.endingHour + user.hourOffsetFromGreece}:00. Σε αυτό το διάστημα θα πρέπει να ενημερώσεις το balance του account σου. Τα trades όμως θα πρέπει να ελέγχεις κάθε μέρα γιατί θα πρέπει να κλείνουν συγκεκριμένη ώρα.`} lettersShow={50} classes="text-gray-400 text-sm" />
                    </div>
                    <div className="flex flex-col gap-4">
                      {openTrades &&
                        openTrades.length > 0 &&
                        openTrades.map((trade) => {
                          // Μετατροπή ξανά σε Date object για να προσθέσουμε το hourOffsetFromGreece
                          const greeceDateObject = new Date(trade.openTime);
                          // Δημιουργούμε το τελικό Date object με το σωστό offset
                          greeceDateObject.setHours(greeceDateObject.getHours() + user.hourOffsetFromGreece);
                          const formattedDate = greeceDateObject.toLocaleDateString("el-GR", {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          });
                          const formattedTime = greeceDateObject.toLocaleTimeString("el-GR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          });

                          let tradeUser;
                          if (trade.firstParticipant.user._id.toString() === user._id.toString()) tradeUser = trade.firstParticipant;
                          if (trade.secondParticipant.user._id.toString() === user._id.toString()) tradeUser = trade.secondParticipant;
                          return <CloseTradeForm UpdateBalance={UpdateBalance} tradeId={trade._id.toString()} userId={tradeUser.user._id.toString()} key={`trade-${trade._id.toString()}`} account={tradeUser.account.number} prevBalance={tradeUser.account.balance} tp={tradeUser.trade.takeProfit} sl={tradeUser.trade.stopLoss} />;
                        })}
                    </div>
                  </div>
                )}
                {/* Προγραμματισμός */}
                {GreeceTime >= settings.acceptTradesHours.startingHour && GreeceTime < settings.acceptTradesHours.endingHour && (
                  <div className="flex flex-col gap-4">
                    <div className="font-semibold">Προγραμματισμός</div>
                    <div className="flex flex-col gap-1">
                      <Explanation
                        text={`Η φάση του προγραμματισμού είναι ενεργή κάθε μέρα από τις ${settings.acceptTradesHours.startingHour + user.hourOffsetFromGreece}:00 έως τις ${
                          settings.acceptTradesHours.endingHour + user.hourOffsetFromGreece
                        }:00. Πάτησε Accept στα trades που μπορείς να βάλεις αύριο. Τα trades με ανοιχτό πορτοκαλί background είναι εντός ωρών που εσύ έχεις δηλώσει ότι μπορείς να βάλεις. Συνεπώς αν τα απορρίψεις θα χρεωθούν στον λογαριασμό σου 10$ για το κάθε ένα. Τα trades με το γκρι background
                      είναι εκτός ωρών σου και μπορείς να τα απορρίψεις χωρίς κανένα πρόβλημα. Τις ημέρες που ξέρεις ότι σίγουρα δεν μπορείς να βάζεις trades εκτός των ωρών σου είναι καλό να απενεργοποιείς την λειτουργία Flexible Suggestions από τα settings ώστε να μην σε λαμβάνει υπόψην του ο αλγόριθμος. Αν πιστεύεις ότι υπάρχει έστω μια περίπτωση κάποια άλλη ώρα να μπορείς να βάλεις κάποιο trade ενεργοποίησε την λειτουργία Flexible Suggestions. Για κάθε trade που βάζεις εκτός των ωρών σου σου πιστώνεται και ένα μικρό bonus 3$.`}
                        lettersShow={50}
                        classes="text-gray-400 text-sm"
                      />
                      <div className="text-sm text-gray-400 flex items-center gap-2">
                        <div>Πήγαινε στο:</div>
                        <Link href="/?mode=tradingsettings" className="text-blue-400 hover:underline">
                          Flexible Suggestions
                        </Link>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      {tradeSuggestions &&
                        tradeSuggestions.length > 0 &&
                        tradeSuggestions.map((trade) => {
                          // Μετατροπή ξανά σε Date object για να προσθέσουμε το hourOffsetFromGreece
                          const greeceDateObject = new Date(trade.openTime);
                          // Δημιουργούμε το τελικό Date object με το σωστό offset
                          greeceDateObject.setHours(greeceDateObject.getHours() + user.hourOffsetFromGreece);
                          const formattedDate = greeceDateObject.toLocaleDateString("el-GR", {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          });
                          const formattedTime = greeceDateObject.toLocaleTimeString("el-GR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          });

                          let tradeUser;

                          if (trade.firstParticipant.user._id.toString() === user._id.toString()) tradeUser = trade.firstParticipant;
                          if (trade.secondParticipant.user._id.toString() === user._id.toString()) tradeUser = trade.secondParticipant;
                          return <TradeItem ChangeTradeStatus={ChangeTradeStatus} tradeId={trade._id.toString()} userId={tradeUser.user._id.toString()} key={`trade-${trade._id.toString()}`} account={tradeUser.account.number} priority={tradeUser.priority} openDate={formattedDate} openTime={formattedTime} status={tradeUser.status} />;
                        })}
                    </div>
                  </div>
                )}
                {/* Προετοιμασία */}
                {GreeceTime >= settings.seeScheduleHours.startingHour && GreeceTime < settings.seeScheduleHours.endingHour && (
                  <div className="flex flex-col gap-4">
                    <div className="font-semibold">Προετοιμασία</div>
                    <div className="flex flex-col gap-1">
                      <Explanation text={`Ακριβώς από κάτω, κάθε μέρα μετά τις ${settings.seeScheduleHours.startingHour + user.hourOffsetFromGreece}:00, θα βρίσκεις τα trades που πρέπει να βάλεις την επόμενη ημέρα. Θα πρέπει να βάλεις τα ξυπνητήρια σου ώρες τέτοιες ώστε να μπορέσεις να διεκπεραιώσεις τα trades σίγουρα, χωρίς βιασύνη, με άνεση χρόνου.`} lettersShow={50} classes="text-gray-400 text-sm" />
                    </div>
                    <div className="flex gap-4">
                      {forOpening &&
                        forOpening.length > 0 &&
                        forOpening.map((trade) => {
                          // Μετατροπή ξανά σε Date object για να προσθέσουμε το hourOffsetFromGreece
                          const greeceDateObject = new Date(trade.openTime);
                          // Δημιουργούμε το τελικό Date object με το σωστό offset
                          greeceDateObject.setHours(greeceDateObject.getHours() + user.hourOffsetFromGreece);
                          const formattedDate = greeceDateObject.toLocaleDateString("el-GR", {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          });
                          const formattedTime = greeceDateObject.toLocaleTimeString("el-GR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          });

                          let tradeUser;
                          if (trade.firstParticipant.user._id.toString() === user._id.toString()) tradeUser = trade.firstParticipant;
                          if (trade.secondParticipant.user._id.toString() === user._id.toString()) tradeUser = trade.secondParticipant;
                          return <TomorrowTradeItem key={`tomorrow-${trade._id.toString()}`} account={tradeUser.account.number} openDate={formattedDate} openTime={formattedTime} />;
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
            {mode === "accounts" && <AccountsList accounts={user.accounts.sort((a, b) => a.phase - b.phase)} />}
            {mode === "tradingsettings" && (
              <div className="flex justify-center">
                <ScheduleForm SaveSchedule={SaveSchedule} ToggleFlexibleSuggestions={ToggleFlexibleSuggestions} ChangeHourOffsetFromGreece={ChangeHourOffsetFromGreece} id={id} oldStartingHour={user.tradingHours.startingTradingHour} oldEndingHour={user.tradingHours.endingTradingHour} oldSuggestionsStatus={user.flexibleTradesSuggestions} oldOffset={user.hourOffsetFromGreece} />
              </div>
            )}
            {mode === "tickets" && <div className="text-gray-400 animate-pulse">Under Construction</div>}
            {mode === "companies" && (
              <div className="w-full text-center text-gray-400">
                <ManageCompanies userId={user._id.toString()} allCompanies={companies} userCompanies={user.companies} />
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

const MenuItem = ({ name, link, info, icon, size }) => {
  return (
    <Link className="text-blue-500 font-semibold hover:text-blue-400 flex items-center justify-between gap-4" href={link}>
      <div className="flex items-center gap-4">
        <Image src={icon} alt="" width={size} height={size} />
        <div className="hidden md:block">{name}</div>
      </div>
      {info && <InfoButton message={info} />}
    </Link>
  );
};
