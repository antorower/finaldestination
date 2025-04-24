export const dynamic = "force-dynamic";

import Explanation from "@/components/Explanation";
import Link from "next/link";
import OpenTradeItem from "./OpenTradeItem";
import Trade from "@/models/Trade";
import Pair from "@/models/Pair";
import dbConnect from "@/dbConnect";
import { revalidatePath } from "next/cache";
import Settings from "@/models/Settings";
import { AddActivity } from "@/library/AddActivity";
import { ConvertToUserTime } from "@/library/Hours";

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
    await dbConnect();

    // Παίρνουμε τα settings ολόκληρα για να τα χρησιμοποιήσουμε αργότερα
    const settings = await Settings.findOne().populate("monday.pairs tuesday.pairs wednesday.pairs thursday.pairs friday.pairs");

    const today = new Date().toLocaleString("en-us", { weekday: "long" }).toLowerCase();
    const todaySettings = settings[today];

    if (!todaySettings?.active) {
      return { error: true, message: "Οι συναλλαγές δεν είναι ενεργές για σήμερα." };
    }

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
    console.log("1");
    // Ελέγχω αν και οι δύο traders έχουν δηλώσει το παρών
    if (currentTrade.firstParticipant.user.toString() === userId) {
      console.log("1.1");
      if (currentTrade.secondParticipant.status === "accepted") {
        console.log("1.2");
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
      console.log("1.3");
      if (currentTrade.firstParticipant.status === "accepted") {
        console.log("1.4");
        currentTrade.secondParticipant.status = "try";
        await currentTrade.save();
        const activityTitle = "Προσπάθεια ανοίγματος trade";
        const activityDescription = "Ο χρήστης προσπάθησε να τραβήξει trade αλλά το trade ακυρώθηκε.";
        const activitySign = "neutral";
        await AddActivity({ user: userId, trade: tradeId, account: accountId, title: activityTitle, activitySign, description: activityDescription });
        return { error: true, message: "Το trade ακυρώθηκε" };
      }
    }
    console.log("2");
    // Εντοπισμός του σωστού participant και αλλαγή του status του σε "open" αν υπάρχει ήδη trade
    if (currentTrade.firstParticipant.user.toString() === userId && currentTrade.firstParticipant?.trade?.pair) {
      console.log("2.1");
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
      console.log("2.2");
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
    console.log("3");
    // Υπολογίζουμε το χρονικό όριο (40 λεπτά πριν)
    const fortyMinutesAgo = new Date(Date.now() - 40 * 60 * 1000);

    // Παίρνουμε όλα τα trades που είναι accepted ή open και έχουν openTime μέσα στα τελευταία 40 λεπτά
    const allTrades = await Trade.find({
      status: { $in: ["accepted", "open"] },
      openTime: { $gte: fortyMinutesAgo },
    })
      .populate("firstParticipant.account")
      .populate("secondParticipant.account");

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
      if (trade.firstParticipant.account?.company?.toString() === firstCompanyId || trade.firstParticipant.account?.company?.toString() === secondCompanyId) {
        usedPairsByFirstCompany.add(trade.firstParticipant.trade?.pair);
      }
      if (trade.secondParticipant.account?.company?.toString() === secondCompanyId || trade.secondParticipant.account?.company?.toString() === firstCompanyId) {
        usedPairsBySecondCompany.add(trade.secondParticipant.trade?.pair);
      }
    });
    console.log("4");
    // Επιπλέον, ελέγχουμε αν ο χρήστης έχει ήδη ανοίξει trade σήμερα στην ίδια εταιρεία
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const userTradesToday = await Trade.find({
      $or: [{ "firstParticipant.user": userId }, { "secondParticipant.user": userId }],
      openTime: { $gte: todayStart },
    }).populate("firstParticipant.account secondParticipant.account");

    if (userTradesToday && userTradesToday.length > 0) {
      userTradesToday.forEach((trade) => {
        if (trade.firstParticipant.account?.company?.toString() === firstCompanyId || trade.firstParticipant.account?.company?.toString() === secondCompanyId) {
          usedPairsByFirstCompany.add(trade.firstParticipant.trade?.pair);
        }
        if (trade.secondParticipant.account?.company?.toString() === secondCompanyId || trade.secondParticipant.account?.company?.toString() === firstCompanyId) {
          usedPairsBySecondCompany.add(trade.secondParticipant.trade?.pair);
        }
      });
    }
    console.log("5");
    // Φιλτράρουμε τα διαθέσιμα pairs ώστε να μην περιέχουν αυτά που έχουν ήδη χρησιμοποιηθεί
    let filteredPairsFirstCompany = availablePairs.filter((pair) => pair && !usedPairsByFirstCompany.has(pair.name));
    let filteredPairsSecondCompany = availablePairs.filter((pair) => pair && !usedPairsBySecondCompany.has(pair.name));

    // Για CHATGPT: Δεν θελω να αλλαξει τιποτα απολυτως σε ολο το function. Θελω απλα να βρουμε απο την βαση δεδομενων τα trades ολης της σημερνινης ημερας
    // που εχουν users εναν απο τους δυο και εταιρια μια απο τις δυο και οσα εχουν pair να το αφαιρεσουμε απο το filteredPairsFirstCompany και filteredPairsSecondCxompany
    // Βρίσκουμε τα trades της σημερινής ημέρας όπου:
    // - Ο firstParticipant ή ο family του έχει εταιρεία την ίδια με τον currentTrade.firstParticipant.account.company
    // - Ο secondParticipant ή ο family του έχει εταιρεία την ίδια με τον currentTrade.secondParticipant.account.company
    const todayTrades = await Trade.find({
      $or: [
        {
          "firstParticipant.account.company": firstCompanyId,
          $or: [{ "firstParticipant.user": { $in: [currentTrade.firstParticipant.user, currentTrade.secondParticipant.user] } }, { "firstParticipant.user.family": { $in: [currentTrade.firstParticipant.user, currentTrade.secondParticipant.user] } }],
        },
        {
          "secondParticipant.account.company": secondCompanyId,
          $or: [{ "secondParticipant.user": { $in: [currentTrade.firstParticipant.user, currentTrade.secondParticipant.user] } }, { "secondParticipant.user.family": { $in: [currentTrade.firstParticipant.user, currentTrade.secondParticipant.user] } }],
        },
      ],
      openTime: { $gte: todayStart },
    }).populate("firstParticipant.account secondParticipant.account firstParticipant.user.family secondParticipant.user.family");

    // Αφαίρεση των χρησιμοποιημένων pairs από τα filteredPairsFirstCompany και filteredPairsSecondCompany
    todayTrades.forEach((trade) => {
      if (trade.firstParticipant.trade?.pair) {
        filteredPairsFirstCompany = filteredPairsFirstCompany.filter((pair) => pair.name !== trade.firstParticipant.trade.pair);
      }
      if (trade.secondParticipant.trade?.pair) {
        filteredPairsSecondCompany = filteredPairsSecondCompany.filter((pair) => pair.name !== trade.secondParticipant.trade.pair);
      }
    });

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
    console.log("Best pair:", bestPair.name);

    const firstParticipantAccount = currentTrade.firstParticipant.account;
    let firstParticipantPhase;
    if (firstParticipantAccount.phase === 1) firstParticipantPhase = "phase1";
    if (firstParticipantAccount.phase === 2) firstParticipantPhase = "phase2";
    if (firstParticipantAccount.phase === 3) firstParticipantPhase = "phase3";
    const firstParticipantRemainingProfit = (firstParticipantAccount.capital * firstParticipantAccount.company[firstParticipantPhase].target) / 100 + firstParticipantAccount.capital - firstParticipantAccount.balance;
    const firstParticipantRemainingLoss = firstParticipantAccount.balance - firstParticipantAccount.capital + (firstParticipantAccount.capital * firstParticipantAccount.company[firstParticipantPhase].totalDrawdown) / 100;
    let firstParticipantMaxLoss = firstParticipantAccount.manualMaxRisk ? firstParticipantAccount.manualMaxRisk : (firstParticipantAccount.company[firstParticipantPhase].maxRiskPerTrade * firstParticipantAccount.capital) / 100;
    firstParticipantMaxLoss = Math.min(firstParticipantMaxLoss, firstParticipantRemainingLoss);

    const secondParticipantAccount = currentTrade.secondParticipant.account;
    let secondParticipantPhase;
    if (secondParticipantAccount.phase === 1) secondParticipantPhase = "phase1";
    if (secondParticipantAccount.phase === 2) secondParticipantPhase = "phase2";
    if (secondParticipantAccount.phase === 3) secondParticipantPhase = "phase3";
    const secondParticipantRemainingProfit = (secondParticipantAccount.capital * secondParticipantAccount.company[secondParticipantPhase].target) / 100 + secondParticipantAccount.capital - secondParticipantAccount.balance;
    const secondParticipantRemainingLoss = secondParticipantAccount.balance - secondParticipantAccount.capital + (secondParticipantAccount.capital * secondParticipantAccount.company[secondParticipantPhase].totalDrawdown) / 100;
    let secondParticipantMaxLoss = secondParticipantAccount.manualMaxRisk ? secondParticipantAccount.manualMaxRisk : (secondParticipantAccount.company[secondParticipantPhase].maxRiskPerTrade * secondParticipantAccount.capital) / 100;
    secondParticipantMaxLoss = Math.min(secondParticipantMaxLoss, secondParticipantRemainingLoss);

    console.log("6");
    let firstTakeProfit;
    let secondTakeProfit;
    let firstStopLoss;
    let secondStopLoss;

    // Όταν πρέπει να περάσει δίνω στο tp και το cost
    let firstCost = false;
    let secondCost = false;

    // Προτιμώ να δίνω gap με πιο χαμηλό tp αλλά αν είναι να περάσει προτιμώ πιο υψηλό sl
    let firstGapTp = false;
    let firstGapSl = false;
    let secondGapTp = false;
    let secondGapSl = false;

    let lostFactor = 1;

    if (firstParticipantAccount.phase - secondParticipantAccount.phase === 0) {
      if (firstParticipantRemainingProfit < secondParticipantMaxLoss) {
        firstTakeProfit = firstParticipantRemainingProfit;
        firstCost = true;
        firstGapSl = true;
      } else {
        firstTakeProfit = Math.random() * (secondParticipantMaxLoss - secondParticipantMaxLoss * 0.8) + secondParticipantMaxLoss * 0.8;
        firstGapTp = true;
      }
      secondStopLoss = firstTakeProfit;

      if (secondParticipantRemainingProfit < firstParticipantMaxLoss) {
        secondTakeProfit = secondParticipantRemainingProfit;
        secondCost = true;
        secondGapSl = true;
      } else {
        secondTakeProfit = Math.random() * (firstParticipantMaxLoss - firstParticipantMaxLoss * 0.8) + firstParticipantMaxLoss * 0.8;
        secondGapTp = true;
      }
      firstStopLoss = secondTakeProfit;
    }

    if (Math.abs(firstParticipantAccount.phase - secondParticipantAccount.phase) > 0) {
      console.log("IS DIFFERENT PHASE");
      const isTherePhase3 = firstParticipantAccount.phase === 3 || secondParticipantAccount.phase === 3;
      const phaseDifference = Math.abs(firstParticipantAccount.phase - secondParticipantAccount.phase);
      let phaseFactor = 1;
      if (phaseDifference === 2) {
        phaseFactor = 3;
        lostFactor = 3;
      }
      if (phaseDifference === 1) {
        if (isTherePhase3) {
          phaseFactor = 1.7;
          lostFactor = 1.7;
        } else {
          phaseFactor = 2;
          lostFactor = 2;
        }
      }
      console.log("PHASE FACTOR", phaseFactor);
      if (firstParticipantAccount.phase > secondParticipantAccount.phase) {
        if (firstParticipantRemainingProfit < secondParticipantMaxLoss / phaseFactor) {
          firstTakeProfit = firstParticipantRemainingProfit;
          firstCost = true;
          firstGapSl = true;
        } else {
          firstTakeProfit = (Math.random() * (secondParticipantMaxLoss - secondParticipantMaxLoss * 0.8) + secondParticipantMaxLoss * 0.8) / phaseFactor;
          firstGapTp = true;
        }
        secondStopLoss = firstTakeProfit * phaseFactor;

        if (secondParticipantRemainingProfit < firstParticipantMaxLoss) {
          secondTakeProfit = secondParticipantRemainingProfit;
          secondCost = true;
          secondGapSl = true;
        } else {
          secondTakeProfit = Math.random() * (firstParticipantMaxLoss - firstParticipantMaxLoss * 0.8) + firstParticipantMaxLoss * 0.8;
          secondGapTp = true;
        }
        firstStopLoss = secondTakeProfit / phaseFactor;
      }

      if (firstParticipantAccount.phase < secondParticipantAccount.phase) {
        if (firstParticipantRemainingProfit < secondParticipantMaxLoss) {
          firstTakeProfit = firstParticipantRemainingProfit;
          firstCost = true;
          firstGapSl = true;
        } else {
          firstTakeProfit = Math.random() * (secondParticipantMaxLoss - secondParticipantMaxLoss * 0.8) + secondParticipantMaxLoss * 0.8;
          firstGapTp = true;
        }
        secondStopLoss = firstTakeProfit / phaseFactor;

        if (secondParticipantRemainingProfit < firstParticipantMaxLoss / phaseFactor) {
          secondTakeProfit = secondParticipantRemainingProfit;
          secondCost = true;
          secondGapSl = true;
        } else {
          secondTakeProfit = (Math.random() * (firstParticipantMaxLoss - firstParticipantMaxLoss * 0.8) + firstParticipantMaxLoss * 0.8) / phaseFactor;
          secondGapTp = true;
        }
        firstStopLoss = secondTakeProfit * phaseFactor;
      }
    }

    console.log("7");
    console.log("firstParticipantRemainingProfit", firstParticipantRemainingProfit);
    console.log("firstParticipantRemainingLoss", firstParticipantRemainingLoss);
    console.log("firstParticipantMaxLoss", firstParticipantMaxLoss);
    console.log("secondParticipantRemainingProfit", secondParticipantRemainingProfit);
    console.log("secondParticipantRemainingLoss", secondParticipantRemainingLoss);
    console.log("secondParticipantMaxLoss", secondParticipantMaxLoss);

    console.log("First Take Profit: ", firstTakeProfit);
    console.log("First Stop Loss: ", firstStopLoss);
    console.log("Second Take Profit: ", secondTakeProfit);
    console.log("Scond Stop Loss: ", secondStopLoss);
    /* if (firstParticipantRemainingProfit < secondParticipantMaxLoss) {
      console.log("7.1");
      firstTakeProfit = firstParticipantRemainingProfit;
      secondStopLoss = firstTakeProfit;
      firstCost = true;
      firstGapTp = false;
    }
    if (secondParticipantRemainingProfit < firstParticipantMaxLoss) {
      console.log("7.2");
      secondTakeProfit = secondParticipantRemainingProfit;
      firstStopLoss = secondTakeProfit;
      secondCost = true;
      secondGapTp = false;
    }

    if (firstParticipantRemainingLoss < secondParticipantMaxLoss) {
      console.log("7.3");
      firstStopLoss = firstParticipantRemainingLoss;
      secondTakeProfit = firstStopLoss;
      firstGapSl = false;
    }
    if (secondParticipantRemainingLoss < firstParticipantMaxLoss) {
      console.log("7.4");
      secondStopLoss = secondParticipantRemainingLoss;
      firstTakeProfit = secondStopLoss;
      secondGapSl = false;
    }
    console.log("8");
    if (firstParticipantRemainingProfit >= secondParticipantMaxLoss && firstParticipantRemainingLoss >= secondParticipantMaxLoss) {
      console.log("8.1");
      firstTakeProfit = Math.random() * (secondParticipantMaxLoss - secondParticipantMaxLoss * 0.8) + secondParticipantMaxLoss * 0.8;
      secondStopLoss = firstTakeProfit;
    }
    if (secondParticipantRemainingProfit >= firstParticipantMaxLoss && secondParticipantRemainingLoss >= firstParticipantMaxLoss) {
      console.log("8.2");
      secondTakeProfit = Math.random() * (firstParticipantMaxLoss - firstParticipantMaxLoss * 0.8) + firstParticipantMaxLoss * 0.8;
      firstStopLoss = secondTakeProfit;
    }*/

    // Τυχαία επιλογή Buy/Sell
    const firstPosition = Math.random() < 0.5 ? "Buy" : "Sell";
    const secondPosition = firstPosition === "Buy" ? "Sell" : "Buy";
    console.log("9");
    const minimumProfit = Math.min(firstTakeProfit, secondTakeProfit);
    let lots = (bestPair.lots * minimumProfit) / 1000;
    console.log("lots 1", lots);
    if (currentTrade.firstParticipant.account.company.maxLots < lots || currentTrade.secondParticipant.account.company.maxLots < lots) {
      console.log("9.1");
      const maxLots = Math.min(currentTrade.firstParticipant.account.company.maxLots, currentTrade.secondParticipant.account.company.maxLots);
      lots = Math.random() * (maxLots * 0.99 - maxLots * 0.9) + maxLots * 0.9;
    }

    let firstLots = lots;
    let secondLots = lots;

    if (firstParticipantAccount.phase > secondParticipantAccount.phase) {
      firstLots = firstLots / lostFactor;
    }
    if (firstParticipantAccount.phase < secondParticipantAccount.phase) {
      secondLots = secondLots / lostFactor;
    }

    if (firstCost) firstTakeProfit = firstTakeProfit + bestPair.costFactor * firstLots;
    if (secondCost) secondTakeProfit = secondTakeProfit + bestPair.costFactor * secondLots;
    console.log("First Cost ", firstCost);
    console.log("Second Cost ", secondCost);
    console.log(firstTakeProfit, secondTakeProfit, firstStopLoss, secondStopLoss);

    if (firstGapTp) {
      firstTakeProfit = firstTakeProfit - settings.targetsGap[firstParticipantPhase] * firstLots;
      console.log("firstTakeProfit", firstTakeProfit);
    } else {
      firstStopLoss = firstStopLoss + settings.targetsGap[firstParticipantPhase] * firstLots;
      console.log("firstStopLoss", firstStopLoss);
    }
    if (secondGapTp) {
      secondTakeProfit = secondTakeProfit - settings.targetsGap[firstParticipantPhase] * secondLots;
      console.log("secondTakeProfit", secondTakeProfit);
    } else {
      secondStopLoss = secondStopLoss + settings.targetsGap[firstParticipantPhase] * secondLots;
      console.log("secondStopLoss", secondStopLoss);
    }
    console.log("9.2");
    // Ανάθεση στο currentTrade
    currentTrade.firstParticipant.trade = {
      pair: bestPair.name, // Θα πρέπει να οριστεί
      lots: firstLots - 0.01, // Θα πρέπει να οριστεί
      position: firstPosition,
      takeProfit: Math.floor(firstTakeProfit),
      stopLoss: Math.floor(firstStopLoss),
    };
    console.log("currentTrade FP", currentTrade.firstParticipant);
    currentTrade.secondParticipant.trade = {
      pair: bestPair.name, // Θα πρέπει να οριστεί
      lots: secondLots - (Math.random() * (0.06 - 0.02) + 0.02),
      position: secondPosition,
      takeProfit: Math.floor(secondTakeProfit),
      stopLoss: Math.floor(secondStopLoss),
    };
    console.log("currentTrade SP", currentTrade.secondParticipant);
    console.log(currentTrade.firstParticipant.user.toString());
    console.log(userId);
    console.log(currentTrade.firstParticipant?.trade?.pair);
    if (currentTrade.firstParticipant.user.toString() === userId && currentTrade.firstParticipant?.trade?.pair) {
      console.log("11.1");
      currentTrade.firstParticipant.status = "open";
      currentTrade.firstParticipant.account.needBalanceUpdate = true;
      currentTrade.firstParticipant.account.note = "Ενημέρωσε Balance";
      await currentTrade.firstParticipant.account.save();
    }
    console.log(currentTrade.secondParticipant.user.toString());
    console.log(userId);
    console.log(currentTrade.secondParticipant?.trade?.pair);
    if (currentTrade.secondParticipant.user.toString() === userId && currentTrade.secondParticipant?.trade?.pair) {
      console.log("11.2");
      currentTrade.secondParticipant.status = "open";
      currentTrade.secondParticipant.account.needBalanceUpdate = true;
      currentTrade.secondParticipant.account.note = "Ενημέρωσε Balance";
      await currentTrade.secondParticipant.account.save();
    }
    console.log("END");
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

const TradingSection = async ({ GreeceTime, settings, user, forOpening, mode, accountcheck, tradecheck, tradepar }) => {
  if (mode) return null;

  const now = new Date();
  const openTime = new Date(now);
  openTime.setDate(now.getDate() + 1); // Αυριανή ημερομηνία
  openTime.setUTCHours(0, 0, 0, 0); // Ξεκινάμε από τα μεσάνυχτα UTC

  // Παίρνουμε το UTC timestamp
  const utcTimestamp = now.getTime();
  // Παίρνουμε το timestamp για την Ελλάδα
  const greeceTime = new Date().toLocaleString("en-US", { timeZone: "Europe/Athens" });
  const greeceDate = new Date(greeceTime);
  const greeceTimestamp = greeceDate.getTime();

  // Υπολογίζουμε το offset της Ελλάδας
  const greeceOffset = Math.ceil((greeceTimestamp - utcTimestamp) / 60000);

  // Μετατροπή του `openTime` στην ώρα Ελλάδας
  openTime.setUTCMinutes(openTime.getUTCMinutes() - greeceOffset);

  // Προσθέτουμε την επιλεγμένη ώρα (selectedTime)
  openTime.setUTCMinutes(openTime.getUTCMinutes() + 65);

  const text = `Κάθε μέρα από τις ${4 + user.hourOffsetFromGreece}:00 
  έως τις ${10 + user.hourOffsetFromGreece}:00 
  πρέπει να βάλεις τα trades σου ακριβώς την ώρα που γράφει στο κάθε ένα. Μια ώρα με 10 λεπτά πριν την ώρα που πρέπει να ανοίξει το trade πρέπει να πατήσεις Aware και 7 με 10 λεπτά πριν την ώρα που πρέπει να ανοίξει το trade πρέπει να πατήσεις Open Trade και να προετοιμάσεις το trade σου ώστε να ανοίξει ακριβώς την ώρα που γράφει. Μπορείς να αλλάξεις τα trading ωράρια σου από τις ρυθμίσεις. Επίσης στις ρυθμίσεις μπορείς να βάλεις την διαφορά ώρας που έχεις με την Ελλάδα ώστε οι ώρες που θα βλέπεις στην σελίδα να ταιριάζουν με την τοπική σου. Θυμήσου ότι για να πατήσεις Aware θα πρέπει να είσαι σίγουρος ότι μπορείς να κάνεις login στο account σου και το account μπορεί να δεχτεί trades. Αν δεν είσαι σίγουρος για αυτά τα δύο αργά ή γρήγορα θα έρθει η ώρα που θα έχεις 5-6 λεπτά να βάλεις το trade και δεν θα μπορείς να μπεις στο account ή το account δεν θα είναι έτοιμο να δεχτεί trade ενώ εσύ το έχεις τραβήξει. Αυτό σημαίνει ότι θα χρεωθείς το λάθος αυτόματα, από 100$ μέχρι και 1600$ ανάλογα την περίπτωση.`;

  if (GreeceTime >= settings.tradingHours.startingHour - 1 && GreeceTime < settings.tradingHours.endingHour) {
    return (
      <div className="flex flex-col gap-4">
        <div className="font-semibold">Trading</div>
        <div className="flex flex-col gap-2">
          <Explanation text={text} lettersShow={50} classes="text-gray-400 text-sm" />
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
              const timeObject = ConvertToUserTime(trade.openTime, user.hourOffsetFromGreece * 60);

              let tradeUser;
              let opponentUser;
              if (trade.firstParticipant.user._id.toString() === user._id.toString()) {
                tradeUser = trade.firstParticipant;
                opponentUser = trade.secondParticipant;
              }
              if (trade.secondParticipant.user._id.toString() === user._id.toString()) {
                tradeUser = trade.secondParticipant;
                opponentUser = trade.firstParticipant;
              }

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
                  openDate={timeObject.date}
                  openTime={timeObject.time}
                  status={tradeUser.status}
                  checked={tradeUser.checked}
                  accountCheck={accountcheck === "true" ? true : false}
                  tradeCheck={tradecheck === "true" ? true : false}
                  trade={tradeUser.trade}
                  tradepar={tradepar}
                  telephone={tradeUser.user.tel && opponentUser.user.tel ? opponentUser.user.telephone : null}
                  opponentName={opponentUser.user.firstName + " " + opponentUser.user.lastName}
                  TradeChecked={TradeChecked}
                />
              );
            })}

          {(!forOpening || forOpening.length === 0) && <div className="animate-pulse text-gray-500">Δεν υπάρχουν trades για εσένα σήμερα</div>}
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default TradingSection;
