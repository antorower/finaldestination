import OpenTrade from "./OpenTrade";
import Trade from "@/models/Trade";
import Company from "@/models/Company";
import Settings from "@/models/Settings";
import { revalidatePath } from "next/cache";
import dbConnect from "@/dbConnect";

export const Open = async ({ trade, user }) => {
  "use server";
  try {
    await dbConnect();

    // Βρίσκουμε το αρχικό trade
    const baseTrade = await Trade.findById(trade)
      .populate({
        path: "firstParticipant.account",
        populate: { path: "company" }, // <-- Κάνει deep populate στο company
      })
      .populate({
        path: "secondParticipant.account",
        populate: { path: "company" }, // <-- Κάνει deep populate στο company
      });
    if (!baseTrade) return false;

    const isFirstParticipant = baseTrade.firstParticipant.user.toString() === user;
    const isSecondParticipant = baseTrade.secondParticipant.user.toString() === user;

    if (isFirstParticipant) {
      if (baseTrade.firstParticipant.trade.pair) {
        baseTrade.firstParticipant.status === "open";
        return true;
      }
    }
    if (isSecondParticipant) {
      if (baseTrade.secondParticipant.trade.pair) {
        baseTrade.secondParticipant.status === "open";
        return true;
      }
    }

    // Παίρνουμε την ημερομηνία και το openTime του αρχικού trade
    const { year, month, day, hour, minutes } = baseTrade.openTime;

    // Υπολογίζουμε το χρονικό όριο για τα 30 λεπτά πριν
    let startHour = hour;
    let startMinutes = minutes - 30;

    // Αν τα λεπτά είναι αρνητικά, αφαιρούμε μία ώρα και προσαρμόζουμε τα λεπτά
    if (startMinutes < 0) {
      startHour -= 1;
      startMinutes += 60;
    }

    // Βρίσκουμε τα trades που πληρούν τα κριτήρια
    // Να είναι σημερινά
    // Να έχουν ανοίξει το τελευταίο μισάωρο
    // Populate accounts και τα companies τους
    const trades = await Trade.find({
      status: { $in: ["open", "openPending"] },
      "openTime.year": year,
      "openTime.month": month,
      "openTime.day": day,
      $or: [
        {
          // Αν είναι μεγαλύτερη ώρα, είναι εντός εύρους
          "openTime.hour": { $gt: startHour },
        },
        {
          // Αν είναι ίδια ώρα, ελέγχουμε τα λεπτά
          "openTime.hour": startHour,
          "openTime.minutes": { $gte: startMinutes },
        },
      ],
    })
      .populate("firstParticipant.account")
      .populate("firstParticipant.account.company")
      .populate("secondParticipant.account")
      .populate("secondParticipant.account.company");

    // Δημιουργούμε ένα object (map) για τα pairs κάθε εταιρείας
    const companyPairsMap = {}; // <---- map με τις εταιριες και τα pairs που εχουν ανοιχτα
    // Περνάμε από κάθε trade και προσθέτουμε τα pairs στις εταιρείες
    trades.forEach((trade) => {
      const firstCompanyId = trade.firstParticipant?.account?.company?._id?.toString();
      const secondCompanyId = trade.secondParticipant?.account?.company?._id?.toString();

      let firstPair = trade.firstParticipant?.trade?.pair;
      let secondPair = trade.secondParticipant?.trade?.pair;

      // Αν η πρώτη εταιρεία έχει pair και η δεύτερη δεν έχει, τότε παίρνει το ίδιο pair
      if (firstPair && !secondPair) {
        secondPair = firstPair;
      }
      // Αν η δεύτερη εταιρεία έχει pair και η πρώτη δεν έχει, τότε παίρνει το ίδιο pair
      if (secondPair && !firstPair) {
        firstPair = secondPair;
      }

      if (firstCompanyId && firstPair) {
        companyPairsMap[firstCompanyId] = companyPairsMap[firstCompanyId] || [];
        companyPairsMap[firstCompanyId].push(firstPair);
      }

      if (secondCompanyId && secondPair) {
        companyPairsMap[secondCompanyId] = companyPairsMap[secondCompanyId] || [];
        companyPairsMap[secondCompanyId].push(secondPair);
      }
    });

    // Τι ήμερα είναι σήμερα
    const today = new Date();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayDayString = daysOfWeek[today.getDay()];
    // Τα settings της ημέρας στο daySettings
    const settings = await Settings.findOne().populate("monday.pairs tuesday.pairs wednesday.pairs thursday.pairs friday.pairs");
    if (!settings) return false;
    const daySettings = settings[todayDayString] || settings.monday;

    // Παίρνουμε όλα τα pairs από το daySettings (κρατάμε ολόκληρο το object για να έχουμε το priority)
    const allDayPairs = daySettings.pairs;
    console.log(allDayPairs.length);
    // Παίρνουμε τις εταιρείες του firstParticipant και secondParticipant
    const firstCompanyId = baseTrade.firstParticipant?.account?.company?._id?.toString();
    const secondCompanyId = baseTrade.secondParticipant?.account?.company?._id?.toString();

    // Βρίσκουμε τα pairs που έχουν ήδη ανοιχτεί από τις δύο εταιρείες
    const firstCompanyPairs = companyPairsMap[firstCompanyId] || [];
    const secondCompanyPairs = companyPairsMap[secondCompanyId] || [];

    // Συνδυάζουμε τα pairs που έχουν ήδη ανοιχτεί από τις δύο εταιρείες
    const openedPairs = [...new Set([...firstCompanyPairs, ...secondCompanyPairs])];
    console.log(openedPairs.length);
    // Φιλτράρουμε τα διαθέσιμα pairs αφαιρώντας αυτά που έχουν ήδη ανοιχτεί
    const availablePairs = allDayPairs
      .filter((pair) => !openedPairs.includes(pair.name)) // Φιλτράρουμε βάση του name
      .sort((a, b) => a.priority - b.priority); // Ταξινομούμε βάση priority (μικρότερο πρώτο)

    if (!availablePairs || availablePairs.length === 0) return false;

    // First Participant Metadata
    const firstAccount = baseTrade.firstParticipant.account;
    const firstAccountPhase = firstAccount.company.phases[firstAccount.phase - 1];
    const firstAccountCapital = firstAccount.capital;
    const firstAccountLoseCapital = (firstAccount.capital * (100 - firstAccountPhase.totalDrawdown)) / 100;
    const firstAccountMetadata = {
      remainingTarget: (firstAccountCapital * firstAccountPhase.target) / 100 + firstAccountCapital - firstAccount.balance,
      remainingDrawdown: firstAccount.balance - firstAccountLoseCapital,
      maxRisk: (firstAccountCapital * firstAccountPhase.maxRiskPerTrade) / 100,
    };
    // Second Participant Metadata
    const secondAccount = baseTrade.secondParticipant.account;
    const secondAccountPhase = secondAccount.company.phases[secondAccount.phase - 1];
    const secondAccountCapital = secondAccount.capital;
    const secondAccountLoseCapital = (secondAccount.capital * (100 - secondAccountPhase.totalDrawdown)) / 100;
    const secondAccountMetadata = {
      remainingTarget: (secondAccountCapital * secondAccountPhase.target) / 100 + secondAccountCapital - secondAccount.balance,
      remainingDrawdown: secondAccount.balance - secondAccountLoseCapital,
      maxRisk: (secondAccountCapital * secondAccountPhase.maxRiskPerTrade) / 100,
    };

    // Pair
    baseTrade.firstParticipant.trade.pair = availablePairs[0].name;
    baseTrade.secondParticipant.trade.pair = availablePairs[0].name;
    // Position
    baseTrade.firstParticipant.trade.position = Math.random() < 0.5 ? "Buy" : "Sell";
    baseTrade.secondParticipant.trade.position = baseTrade.firstParticipant.trade.position === "Buy" ? "Sell" : "Buy";

    //First Account Take Profit - Second Account Stop Loss
    if (firstAccount.remainingTarget < secondAccountMetadata.maxRisk + baseTrade.secondParticipant.account.capital * 0.01) {
      baseTrade.firstParticipant.trade.takeProfit = firstAccountMetadata.remainingTarget;
    } else {
      baseTrade.firstParticipant.trade.takeProfit = Math.floor(Math.random() * (secondAccountMetadata.maxRisk - secondAccountMetadata.maxRisk * 0.8 + 1)) + Math.floor(secondAccountMetadata.maxRisk * 0.8);
    }
    baseTrade.secondParticipant.trade.stopLoss = baseTrade.firstParticipant.trade.takeProfit;
    //Second Account Take Profit - First Account Stop Loss
    if (secondAccount.remainingTarget < firstAccountMetadata.maxRisk + baseTrade.firstParticipant.account.capital * 0.01) {
      baseTrade.secondParticipant.trade.takeProfit = secondAccountMetadata.remainingTarget;
    } else {
      baseTrade.secondParticipant.trade.takeProfit = Math.floor(Math.random() * (firstAccountMetadata.maxRisk - firstAccountMetadata.maxRisk * 0.8 + 1)) + Math.floor(firstAccountMetadata.maxRisk * 0.8);
    }
    baseTrade.firstParticipant.trade.stopLoss = baseTrade.secondParticipant.trade.takeProfit;
    // Δεν πρέπει το ένα point να είναι πάνω από 3 φορές μεγαλύτερο από το αντίστοιχο του
    if (baseTrade.firstParticipant.trade.stopLoss > 3 * baseTrade.secondParticipant.trade.takeProfit) {
      baseTrade.firstParticipant.trade.stopLoss = 3 * baseTrade.secondParticipant.trade.takeProfit;
    }
    if (baseTrade.secondParticipant.trade.stopLoss > 3 * baseTrade.firstParticipant.trade.takeProfit) {
      baseTrade.secondParticipant.trade.stopLoss = 3 * baseTrade.firstParticipant.trade.takeProfit;
    }

    let maxValue = Math.max(baseTrade.firstParticipant.trade.stopLoss, baseTrade.firstParticipant.trade.takeProfit, baseTrade.secondParticipant.trade.stopLoss, baseTrade.secondParticipant.trade.takeProfit);

    let baseTradeLots = ((availablePairs[0].lots * maxValue) / 1000).toFixed(2);
    const maxLotsCompany1 = baseTrade.firstParticipant.account.company.maxlots || 100;
    const maxLotsCompany2 = baseTrade.secondParticipant.account.company.maxlots || 100;
    const maxLots = Math.max(maxLotsCompany1, maxLotsCompany2);
    if (maxLots < baseTradeLots) baseTradeLots = maxLots;
    console.log(baseTradeLots);

    baseTrade.firstParticipant.trade.lots = (Math.random() * 2 + (baseTradeLots - 2)).toFixed(2);
    baseTrade.secondParticipant.trade.lots = baseTrade.firstParticipant.trade.lots - (Math.random() * (0.03 - 0.01) + 0.01).toFixed(2);
    console.log(baseTrade.firstParticipant.trade);
    console.log(baseTrade.secondParticipant.trade);

    return trades;
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const AwareTrades = ({ trades, user }) => {
  return (
    <div className="flex flex-wrap justify-center gap-8 my-8">
      {trades.length > 0 &&
        trades.map((trade) => {
          let account;
          const day = trade.openTime.dayString;
          const date = trade.openTime.day + "/" + trade.openTime.month;
          const hour = trade.openTime.hour + ":" + (trade.openTime.minutes < 10 ? `0${trade.openTime.minutes}` : trade.openTime.minutes);

          if (trade.firstParticipant.user._id.toString() === user._id.toString()) {
            account = trade.firstParticipant.account.number;
          }
          if (trade.secondParticipant.user._id.toString() === user._id.toString()) {
            account = trade.secondParticipant.account.number;
          }

          return (
            <div key={`trade-${trade._id.toString()}`} className={`flex flex-col justify-center items-center rounded gap-2 px-4 py-4 border-2 border-purple-500 bg-purple-800`}>
              <div className="text-center rounded flex gap-2 text-2xl font-bold">
                <div>{date}</div>
                <div>{day}</div>
                <div>{hour}</div>
              </div>
              <div className="text-lg flex items-center">στο {account}</div>
              <OpenTrade trade={trade._id.toString()} user={user._id.toString()} Open={Open} />
            </div>
          );
        })}
    </div>
  );
};

export default AwareTrades;
