import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Settings from "@/models/Settings";
import Account from "@/models/Account";
import Trade from "@/models/Trade";
import { revalidatePath } from "next/cache";

export async function GET() {
  await dbConnect();
  console.log("Ξεκίνησε το Matchmaking");
  // Ελεγμένο

  const greeceTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Athens" }));
  const greeceHour = greeceTime.getHours();

  // --> Η today αποθηκεύει την σημερινή ημέρα με πεζά γράμματα
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const todayNumber = new Date().getDay();
  const today = days[todayNumber];
  const tomorrow = days[todayNumber + 1];

  // --> Τραβάω τα settings
  const settings = await Settings.findOne();
  if (!settings) {
    console.log("Τα Settings δεν βρέθηκαν");
    return NextResponse.json({ stopped: true }, { status: 500 });
  }

  if (today === "friday") {
    settings.monday.stringDate = "";
    settings.monday.pairs = [];
    settings.monday.hours = { min: 4, max: 10 };
    settings.monday.note = "";
    settings.monday.closeHour = { hour: null, minutes: null };
    settings.monday.active = false;

    settings.tuesday.stringDate = "";
    settings.tuesday.pairs = [];
    settings.tuesday.hours = { min: 4, max: 10 };
    settings.tuesday.note = "";
    settings.tuesday.closeHour = { hour: null, minutes: null };
    settings.tuesday.active = false;

    settings.wednesday.stringDate = "";
    settings.wednesday.pairs = [];
    settings.wednesday.hours = { min: 4, max: 10 };
    settings.wednesday.note = "";
    settings.wednesday.closeHour = { hour: null, minutes: null };
    settings.wednesday.active = false;

    settings.thursday.stringDate = "";
    settings.thursday.pairs = [];
    settings.thursday.hours = { min: 4, max: 10 };
    settings.thursday.note = "";
    settings.thursday.closeHour = { hour: null, minutes: null };
    settings.thursday.active = false;

    settings.friday.stringDate = "";
    settings.friday.pairs = [];
    settings.friday.hours = { min: 4, max: 10 };
    settings.friday.note = "";
    settings.friday.closeHour = { hour: null, minutes: null };
    settings.friday.active = false;

    await settings.save();

    return NextResponse.json({ reset: true }, { status: 200 });
  }

  if (Number(greeceHour) !== settings.updateBalanceHours.endingHour) {
    console.log("Η ώρα δεν είναι η σωστή: ", greeceHour, `:00. Θα έπρεπε να είναι ${settings.updateBalanceHours.endingHour}:00`);
    return NextResponse.json({ stopped: true }, { status: 200 });
  }

  // <-- Είναι η ελάχιστη διαφορά λεπτών που πρέπει να έχουν τα trades ενός trader μεταξύ τους
  // ώστε να έχει τον χρόνο να ετοιμάσει το επόμενο
  const minutesSpaceBetweenTrades = settings.minutesSpaceBetweenTrades;

  // --> Αν η μέρα δεν είναι active σταματάει η διαδικασία
  if (!settings[tomorrow] || !settings[tomorrow].active) {
    console.log("Η ημέρα δεν είναι active");
    return NextResponse.json({ stopped: true }, { status: 200 });
  }

  // --> Τραβάει όλα τα accounts που δεν θέλει update το balance τους, δεν είναι isOnBoarding και το status τους είναι Live
  // --> Το match: { accepted: true, status: "active" } δεν θα φέρει το user που δεν είναι accepted και active
  const requestedAccounts = await Account.find({
    needBalanceUpdate: false,
    isOnBoarding: false,
    status: "Live",
    $or: [{ adminCaseOn: false }, { adminCaseOn: { $exists: false } }],
  })
    .select("phase balance capital")
    .populate({
      path: "user",
      select: "_id tradingHours flexibleTradesSuggestions timePreference modePreference",
      match: { accepted: true, status: "active" },
    })
    .populate({
      path: "company",
      select: "phase1 phase2 phase3",
    })
    .sort({ phase: -1 })
    .lean();

  // --> Ελέγχω αν το array των accounts είναι άδειο
  if (!requestedAccounts || requestedAccounts.length === 0) {
    console.log("Το array requestedAccounts είναι άδειο");
    return NextResponse.json({ stopped: true }, { status: 500 });
  }

  // --> Αυτό κρατάει μόνο τα accounts που έχουν user
  const filteredAccounts = requestedAccounts.filter((account) => account.user !== null);
  if (!filteredAccounts || filteredAccounts.length === 0) {
    console.log("Το array filteredAccounts είναι άδειο");
    return NextResponse.json({ stopped: true }, { status: 500 });
  }
  console.log("Συνολικός αριθμός accounts: ", filteredAccounts.length);
  // --> Το Map users έχει όλους τους users, τις διαθέσιμες ώρες τους  και τα ωράρια τους
  const users = new Map();

  filteredAccounts.forEach((account) => {
    const userId = account.user._id.toString();
    if (!account?.user?.tradingHours) return;
    if (!users.has(userId)) {
      users.set(userId, {
        tradingHours: {
          minHour: account.user.tradingHours.startingTradingHour * 60,
          maxHour: account.user.tradingHours.endingTradingHour * 60,
        },
        times: [], // Αποθηκεύει τις ώρες που έχει ήδη trade
      });
    }
  });

  // --> Δημιουργεί ένα array που έχει μέσα όλα τα στοιχεία του κάθε account που χρειάζονται για το matchmaking
  const updatedAccounts = filteredAccounts.map((account) => {
    const phases = ["phase1", "phase2", "phase3"];
    const companyPhase = phases[account.phase - 1];

    const target = account.capital + (account.capital * account.company[companyPhase].target) / 100;
    const finalDrawdownBalance = account.capital - (account.capital * account.company[companyPhase].totalDrawdown) / 100;
    const totalAmount = target - finalDrawdownBalance;

    const progress = Math.floor(((account.balance - finalDrawdownBalance) / totalAmount) * 100);

    return {
      _id: account._id.toString(),
      balance: account.balance,
      phase: account.phase,
      capital: account.capital,
      shadowban: account.shadowban,
      user: account.user._id.toString(),
      company: account.company._id.toString(),
      matched: false,
      progress: progress,
      minHour: account.user.tradingHours.startingTradingHour * 60,
      maxHour: account.user.tradingHours.endingTradingHour * 60,
      timePreference: account.user.timePreference,
      modePreference: account.user.modePreference,
      flexibleTradesSuggestions: account.user.flexibleTradesSuggestions,
    };
  });
  // --> Τα κάνει sort με βάση το progress τους
  updatedAccounts.sort((a, b) => b.progress - a.progress);

  //--> Map με τους users και ένα array για τις ωρες
  const userTradeTimes = new Map();
  updatedAccounts.forEach((account) => {
    const userId = account.user;

    if (!userTradeTimes.has(userId)) {
      userTradeTimes.set(userId, []);
    }
  });

  // --> Δείνει ένα array με τα διαθέσιμα λεπτά των users
  const AvailableMinutes = (firstUser, firstStartingHour, firstEndingHour, secondUser, secondStartingHour, secondEndingHour, needCommon) => {
    const commonStarting = Math.max(firstStartingHour, secondStartingHour);
    const commonEnding = Math.min(firstEndingHour, secondEndingHour);
    const notCommonStarting = Math.min(firstStartingHour, secondStartingHour);
    const notCommonEnding = Math.max(firstEndingHour, secondEndingHour);

    if (needCommon && commonStarting > commonEnding) return false;
    const minutes = [];
    if (needCommon) {
      for (let i = commonStarting; i <= commonEnding; i++) {
        minutes.push(i);
      }
    } else {
      for (let i = notCommonStarting; i <= notCommonEnding; i++) {
        minutes.push(i);
      }
    }

    const firstUserTradesHours = userTradeTimes.get(firstUser) || [];
    const secondUserTradesHours = userTradeTimes.get(secondUser) || [];
    const allTradeTimes = [...firstUserTradesHours, ...secondUserTradesHours];
    const filteredCommonMinutes = [];

    for (let i = 0; i < minutes.length; i++) {
      let isValid = true;

      for (let j = 0; j < allTradeTimes.length; j++) {
        if (minutes[i] >= allTradeTimes[j] - minutesSpaceBetweenTrades && minutes[i] <= allTradeTimes[j] + minutesSpaceBetweenTrades) {
          isValid = false;
          break; // Αν βρούμε ότι πρέπει να αφαιρεθεί, δεν χρειάζεται να συνεχίσουμε
        }
      }

      if (isValid) {
        filteredCommonMinutes.push(minutes[i]);
      }
    }

    return filteredCommonMinutes;
  };

  // --> Κυρίως αλγόριθμος

  // --> Κοινές ώρες, ίδιο phase, progress 2
  const trades = [];
  const progressCycle1 = 2;
  for (let i = 0; i < updatedAccounts.length; i++) {
    const firstAccount = updatedAccounts[i];
    for (let j = 0; j < updatedAccounts.length; j++) {
      if (firstAccount.matched) continue;
      if (i === j) continue;
      const secondAccount = updatedAccounts[j];
      if (firstAccount.shadowban || secondAccount.shadowban) continue;
      if (firstAccount.user === secondAccount.user) continue;
      if (secondAccount.matched) continue;
      if (firstAccount.capital < secondAccount.capital * 0.5 || firstAccount.capital > secondAccount.capital * 1.5) continue;
      if (firstAccount.company === secondAccount.company) continue;
      if (firstAccount.phase !== secondAccount.phase) continue;
      if (Math.abs(firstAccount.progress - secondAccount.progress) > progressCycle1) continue;

      const availableMinutes = AvailableMinutes(firstAccount.user, firstAccount.minHour, firstAccount.maxHour, secondAccount.user, secondAccount.minHour, secondAccount.maxHour, true);
      if (!availableMinutes || availableMinutes.length === 0) continue;

      // --> Βρίσκουμε την βέλτιστη δυνατή ώρα για τον user
      let selectedTime;
      if (firstAccount.timePreference === "Early Hours" && secondAccount.timePreference === "Early Hours") {
        // Επιλέγει τυχαία από τις πρώτες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
        selectedTime = availableMinutes[Math.floor(Math.random() * Math.min(5, availableMinutes.length))];
      } else if (firstAccount.timePreference === "Late Hours" && secondAccount.timePreference === "Late Hours") {
        // Επιλέγει τυχαία από τις τελευταίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
        let startIndex = Math.max(0, availableMinutes.length - 5);
        selectedTime = availableMinutes[startIndex + Math.floor(Math.random() * (availableMinutes.length - startIndex))];
      } else if (firstAccount.timePreference !== secondAccount.timePreference) {
        if (firstAccount.modePreference === "Condescending" || secondAccount.modePreference === "Condescending") {
          // Επιλέγει τυχαία από τις μεσαίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
          let midStart = Math.max(0, Math.floor((availableMinutes.length - 5) / 2));
          selectedTime = availableMinutes[midStart + Math.floor(Math.random() * Math.min(5, availableMinutes.length - midStart))];
        } else {
          // Επιλέγει τυχαία από τις πρώτες 5 ή τελευταίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
          if (Math.random() < 0.5) {
            selectedTime = availableMinutes[Math.floor(Math.random() * Math.min(5, availableMinutes.length))]; // Από τις πρώτες 5
          } else {
            let startIndex = Math.max(0, availableMinutes.length - 5);
            selectedTime = availableMinutes[startIndex + Math.floor(Math.random() * (availableMinutes.length - startIndex))]; // Από τις τελευταίες 5
          }
        }
      }

      if (!selectedTime) continue;

      userTradeTimes.get(firstAccount.user).push(selectedTime);
      userTradeTimes.get(secondAccount.user).push(selectedTime);

      const newTrade = {
        firstParticipant: {
          user: firstAccount.user,
          account: firstAccount._id,
          priority: selectedTime >= firstAccount.minHour && selectedTime <= firstAccount.maxHour ? "high" : "low",
          progress: firstAccount.progress,
          status: "pending",
        },
        secondParticipant: {
          user: secondAccount.user,
          account: secondAccount._id,
          priority: selectedTime >= secondAccount.minHour && selectedTime <= secondAccount.maxHour ? "high" : "low",
          progress: secondAccount.progress,
          status: "pending",
        },
        openTime: null,
        status: "pending",
        priority: "",
      };

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
      openTime.setUTCMinutes(openTime.getUTCMinutes() + selectedTime);

      if (newTrade.firstParticipant.priority === "high" && newTrade.secondParticipant.priority === "high") newTrade.priority = "high";
      if (newTrade.firstParticipant.priority === "low" && newTrade.secondParticipant.priority === "low") newTrade.priority = "low";
      if (newTrade.firstParticipant.priority !== newTrade.secondParticipant.priority) newTrade.priority = "medium";

      newTrade.openTime = openTime;
      firstAccount.matched = true;
      secondAccount.matched = true;
      trades.push(newTrade);
    }
  }
  console.log("Trades μετά τον πρώτο κύκλο: ", trades.length);
  // --> Κοινές ώρες, ίδιο phase, progress 4
  const progressCycle5 = 4;
  for (let i = 0; i < updatedAccounts.length; i++) {
    const firstAccount = updatedAccounts[i];
    for (let j = 0; j < updatedAccounts.length; j++) {
      if (firstAccount.matched) continue;
      if (i === j) continue;
      const secondAccount = updatedAccounts[j];
      if (firstAccount.shadowban || secondAccount.shadowban) continue;
      if (firstAccount.user === secondAccount.user) continue;
      if (secondAccount.matched) continue;
      if (firstAccount.capital < secondAccount.capital * 0.5 || firstAccount.capital > secondAccount.capital * 1.5) continue;
      if (firstAccount.company === secondAccount.company) continue;
      if (firstAccount.phase !== secondAccount.phase) continue;
      if (Math.abs(firstAccount.progress - secondAccount.progress) > progressCycle5) continue;

      const availableMinutes = AvailableMinutes(firstAccount.user, firstAccount.minHour, firstAccount.maxHour, secondAccount.user, secondAccount.minHour, secondAccount.maxHour, true);
      if (!availableMinutes || availableMinutes.length === 0) continue;

      // --> Βρίσκουμε την βέλτιστη δυνατή ώρα για τον user
      let selectedTime;
      if (firstAccount.timePreference === "Early Hours" && secondAccount.timePreference === "Early Hours") {
        // Επιλέγει τυχαία από τις πρώτες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
        selectedTime = availableMinutes[Math.floor(Math.random() * Math.min(5, availableMinutes.length))];
      } else if (firstAccount.timePreference === "Late Hours" && secondAccount.timePreference === "Late Hours") {
        // Επιλέγει τυχαία από τις τελευταίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
        let startIndex = Math.max(0, availableMinutes.length - 5);
        selectedTime = availableMinutes[startIndex + Math.floor(Math.random() * (availableMinutes.length - startIndex))];
      } else if (firstAccount.timePreference !== secondAccount.timePreference) {
        if (firstAccount.modePreference === "Condescending" || secondAccount.modePreference === "Condescending") {
          // Επιλέγει τυχαία από τις μεσαίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
          let midStart = Math.max(0, Math.floor((availableMinutes.length - 5) / 2));
          selectedTime = availableMinutes[midStart + Math.floor(Math.random() * Math.min(5, availableMinutes.length - midStart))];
        } else {
          // Επιλέγει τυχαία από τις πρώτες 5 ή τελευταίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
          if (Math.random() < 0.5) {
            selectedTime = availableMinutes[Math.floor(Math.random() * Math.min(5, availableMinutes.length))]; // Από τις πρώτες 5
          } else {
            let startIndex = Math.max(0, availableMinutes.length - 5);
            selectedTime = availableMinutes[startIndex + Math.floor(Math.random() * (availableMinutes.length - startIndex))]; // Από τις τελευταίες 5
          }
        }
      }

      if (!selectedTime) continue;

      userTradeTimes.get(firstAccount.user).push(selectedTime);
      userTradeTimes.get(secondAccount.user).push(selectedTime);

      const newTrade = {
        firstParticipant: {
          user: firstAccount.user,
          account: firstAccount._id,
          priority: selectedTime >= firstAccount.minHour && selectedTime <= firstAccount.maxHour ? "high" : "low",
          progress: firstAccount.progress,
          status: "pending",
        },
        secondParticipant: {
          user: secondAccount.user,
          account: secondAccount._id,
          priority: selectedTime >= secondAccount.minHour && selectedTime <= secondAccount.maxHour ? "high" : "low",
          progress: secondAccount.progress,
          status: "pending",
        },
        openTime: null,
        status: "pending",
        priority: "",
      };

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
      openTime.setUTCMinutes(openTime.getUTCMinutes() + selectedTime);

      if (newTrade.firstParticipant.priority === "high" && newTrade.secondParticipant.priority === "high") newTrade.priority = "high";
      if (newTrade.firstParticipant.priority === "low" && newTrade.secondParticipant.priority === "low") newTrade.priority = "low";
      if (newTrade.firstParticipant.priority !== newTrade.secondParticipant.priority) newTrade.priority = "medium";

      newTrade.openTime = openTime;
      firstAccount.matched = true;
      secondAccount.matched = true;
      trades.push(newTrade);
    }
  }
  console.log("Trades μετά τον πέμπτο κύκλο: ", trades.length);
  // --> Κοινές ώρες, ίδιο phase, progress 6
  const progressCycle6 = 6;
  for (let i = 0; i < updatedAccounts.length; i++) {
    const firstAccount = updatedAccounts[i];
    for (let j = 0; j < updatedAccounts.length; j++) {
      if (firstAccount.matched) continue;
      if (i === j) continue;
      const secondAccount = updatedAccounts[j];
      if (firstAccount.shadowban || secondAccount.shadowban) continue;
      if (firstAccount.user === secondAccount.user) continue;
      if (secondAccount.matched) continue;
      if (firstAccount.capital < secondAccount.capital * 0.5 || firstAccount.capital > secondAccount.capital * 1.5) continue;
      if (firstAccount.company === secondAccount.company) continue;
      if (firstAccount.phase !== secondAccount.phase) continue;
      if (Math.abs(firstAccount.progress - secondAccount.progress) > progressCycle6) continue;

      const availableMinutes = AvailableMinutes(firstAccount.user, firstAccount.minHour, firstAccount.maxHour, secondAccount.user, secondAccount.minHour, secondAccount.maxHour, true);
      if (!availableMinutes || availableMinutes.length === 0) continue;

      // --> Βρίσκουμε την βέλτιστη δυνατή ώρα για τον user
      let selectedTime;
      if (firstAccount.timePreference === "Early Hours" && secondAccount.timePreference === "Early Hours") {
        // Επιλέγει τυχαία από τις πρώτες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
        selectedTime = availableMinutes[Math.floor(Math.random() * Math.min(5, availableMinutes.length))];
      } else if (firstAccount.timePreference === "Late Hours" && secondAccount.timePreference === "Late Hours") {
        // Επιλέγει τυχαία από τις τελευταίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
        let startIndex = Math.max(0, availableMinutes.length - 5);
        selectedTime = availableMinutes[startIndex + Math.floor(Math.random() * (availableMinutes.length - startIndex))];
      } else if (firstAccount.timePreference !== secondAccount.timePreference) {
        if (firstAccount.modePreference === "Condescending" || secondAccount.modePreference === "Condescending") {
          // Επιλέγει τυχαία από τις μεσαίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
          let midStart = Math.max(0, Math.floor((availableMinutes.length - 5) / 2));
          selectedTime = availableMinutes[midStart + Math.floor(Math.random() * Math.min(5, availableMinutes.length - midStart))];
        } else {
          // Επιλέγει τυχαία από τις πρώτες 5 ή τελευταίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
          if (Math.random() < 0.5) {
            selectedTime = availableMinutes[Math.floor(Math.random() * Math.min(5, availableMinutes.length))]; // Από τις πρώτες 5
          } else {
            let startIndex = Math.max(0, availableMinutes.length - 5);
            selectedTime = availableMinutes[startIndex + Math.floor(Math.random() * (availableMinutes.length - startIndex))]; // Από τις τελευταίες 5
          }
        }
      }

      if (!selectedTime) continue;

      userTradeTimes.get(firstAccount.user).push(selectedTime);
      userTradeTimes.get(secondAccount.user).push(selectedTime);

      const newTrade = {
        firstParticipant: {
          user: firstAccount.user,
          account: firstAccount._id,
          priority: selectedTime >= firstAccount.minHour && selectedTime <= firstAccount.maxHour ? "high" : "low",
          progress: firstAccount.progress,
          status: "pending",
        },
        secondParticipant: {
          user: secondAccount.user,
          account: secondAccount._id,
          priority: selectedTime >= secondAccount.minHour && selectedTime <= secondAccount.maxHour ? "high" : "low",
          progress: secondAccount.progress,
          status: "pending",
        },
        openTime: null,
        status: "pending",
        priority: "",
      };

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
      openTime.setUTCMinutes(openTime.getUTCMinutes() + selectedTime);

      if (newTrade.firstParticipant.priority === "high" && newTrade.secondParticipant.priority === "high") newTrade.priority = "high";
      if (newTrade.firstParticipant.priority === "low" && newTrade.secondParticipant.priority === "low") newTrade.priority = "low";
      if (newTrade.firstParticipant.priority !== newTrade.secondParticipant.priority) newTrade.priority = "medium";

      newTrade.openTime = openTime;
      firstAccount.matched = true;
      secondAccount.matched = true;
      trades.push(newTrade);
    }
  }
  console.log("Trades μετά τον πέμπτο κύκλο: ", trades.length);
  // --> Κοινές ώρες, ίδιο phase, progress 8
  const progressCycle7 = 8;
  for (let i = 0; i < updatedAccounts.length; i++) {
    const firstAccount = updatedAccounts[i];
    for (let j = 0; j < updatedAccounts.length; j++) {
      if (firstAccount.matched) continue;
      if (i === j) continue;
      const secondAccount = updatedAccounts[j];
      if (firstAccount.shadowban || secondAccount.shadowban) continue;
      if (firstAccount.user === secondAccount.user) continue;
      if (secondAccount.matched) continue;
      if (firstAccount.capital < secondAccount.capital * 0.5 || firstAccount.capital > secondAccount.capital * 1.5) continue;
      if (firstAccount.company === secondAccount.company) continue;
      if (firstAccount.phase !== secondAccount.phase) continue;
      if (Math.abs(firstAccount.progress - secondAccount.progress) > progressCycle7) continue;

      const availableMinutes = AvailableMinutes(firstAccount.user, firstAccount.minHour, firstAccount.maxHour, secondAccount.user, secondAccount.minHour, secondAccount.maxHour, true);
      if (!availableMinutes || availableMinutes.length === 0) continue;

      // --> Βρίσκουμε την βέλτιστη δυνατή ώρα για τον user
      let selectedTime;
      if (firstAccount.timePreference === "Early Hours" && secondAccount.timePreference === "Early Hours") {
        // Επιλέγει τυχαία από τις πρώτες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
        selectedTime = availableMinutes[Math.floor(Math.random() * Math.min(5, availableMinutes.length))];
      } else if (firstAccount.timePreference === "Late Hours" && secondAccount.timePreference === "Late Hours") {
        // Επιλέγει τυχαία από τις τελευταίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
        let startIndex = Math.max(0, availableMinutes.length - 5);
        selectedTime = availableMinutes[startIndex + Math.floor(Math.random() * (availableMinutes.length - startIndex))];
      } else if (firstAccount.timePreference !== secondAccount.timePreference) {
        if (firstAccount.modePreference === "Condescending" || secondAccount.modePreference === "Condescending") {
          // Επιλέγει τυχαία από τις μεσαίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
          let midStart = Math.max(0, Math.floor((availableMinutes.length - 5) / 2));
          selectedTime = availableMinutes[midStart + Math.floor(Math.random() * Math.min(5, availableMinutes.length - midStart))];
        } else {
          // Επιλέγει τυχαία από τις πρώτες 5 ή τελευταίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
          if (Math.random() < 0.5) {
            selectedTime = availableMinutes[Math.floor(Math.random() * Math.min(5, availableMinutes.length))]; // Από τις πρώτες 5
          } else {
            let startIndex = Math.max(0, availableMinutes.length - 5);
            selectedTime = availableMinutes[startIndex + Math.floor(Math.random() * (availableMinutes.length - startIndex))]; // Από τις τελευταίες 5
          }
        }
      }

      if (!selectedTime) continue;

      userTradeTimes.get(firstAccount.user).push(selectedTime);
      userTradeTimes.get(secondAccount.user).push(selectedTime);

      const newTrade = {
        firstParticipant: {
          user: firstAccount.user,
          account: firstAccount._id,
          priority: selectedTime >= firstAccount.minHour && selectedTime <= firstAccount.maxHour ? "high" : "low",
          progress: firstAccount.progress,
          status: "pending",
        },
        secondParticipant: {
          user: secondAccount.user,
          account: secondAccount._id,
          priority: selectedTime >= secondAccount.minHour && selectedTime <= secondAccount.maxHour ? "high" : "low",
          progress: secondAccount.progress,
          status: "pending",
        },
        openTime: null,
        status: "pending",
        priority: "",
      };

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
      openTime.setUTCMinutes(openTime.getUTCMinutes() + selectedTime);

      if (newTrade.firstParticipant.priority === "high" && newTrade.secondParticipant.priority === "high") newTrade.priority = "high";
      if (newTrade.firstParticipant.priority === "low" && newTrade.secondParticipant.priority === "low") newTrade.priority = "low";
      if (newTrade.firstParticipant.priority !== newTrade.secondParticipant.priority) newTrade.priority = "medium";

      newTrade.openTime = openTime;
      firstAccount.matched = true;
      secondAccount.matched = true;
      trades.push(newTrade);
    }
  }
  console.log("Trades μετά τον πέμπτο κύκλο: ", trades.length);

  const progressCycle8 = 10;
  for (let i = 0; i < updatedAccounts.length; i++) {
    const firstAccount = updatedAccounts[i];
    for (let j = 0; j < updatedAccounts.length; j++) {
      if (firstAccount.matched) continue;
      if (i === j) continue;
      const secondAccount = updatedAccounts[j];
      if (firstAccount.shadowban || secondAccount.shadowban) continue;
      if (firstAccount.user === secondAccount.user) continue;
      if (secondAccount.matched) continue;
      if (firstAccount.capital < secondAccount.capital * 0.5 || firstAccount.capital > secondAccount.capital * 1.5) continue;
      if (firstAccount.company === secondAccount.company) continue;
      if (firstAccount.phase !== secondAccount.phase) continue;
      if (Math.abs(firstAccount.progress - secondAccount.progress) > progressCycle8) continue;

      const availableMinutes = AvailableMinutes(firstAccount.user, firstAccount.minHour, firstAccount.maxHour, secondAccount.user, secondAccount.minHour, secondAccount.maxHour, true);
      if (!availableMinutes || availableMinutes.length === 0) continue;

      // --> Βρίσκουμε την βέλτιστη δυνατή ώρα για τον user
      let selectedTime;
      if (firstAccount.timePreference === "Early Hours" && secondAccount.timePreference === "Early Hours") {
        // Επιλέγει τυχαία από τις πρώτες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
        selectedTime = availableMinutes[Math.floor(Math.random() * Math.min(5, availableMinutes.length))];
      } else if (firstAccount.timePreference === "Late Hours" && secondAccount.timePreference === "Late Hours") {
        // Επιλέγει τυχαία από τις τελευταίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
        let startIndex = Math.max(0, availableMinutes.length - 5);
        selectedTime = availableMinutes[startIndex + Math.floor(Math.random() * (availableMinutes.length - startIndex))];
      } else if (firstAccount.timePreference !== secondAccount.timePreference) {
        if (firstAccount.modePreference === "Condescending" || secondAccount.modePreference === "Condescending") {
          // Επιλέγει τυχαία από τις μεσαίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
          let midStart = Math.max(0, Math.floor((availableMinutes.length - 5) / 2));
          selectedTime = availableMinutes[midStart + Math.floor(Math.random() * Math.min(5, availableMinutes.length - midStart))];
        } else {
          // Επιλέγει τυχαία από τις πρώτες 5 ή τελευταίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
          if (Math.random() < 0.5) {
            selectedTime = availableMinutes[Math.floor(Math.random() * Math.min(5, availableMinutes.length))]; // Από τις πρώτες 5
          } else {
            let startIndex = Math.max(0, availableMinutes.length - 5);
            selectedTime = availableMinutes[startIndex + Math.floor(Math.random() * (availableMinutes.length - startIndex))]; // Από τις τελευταίες 5
          }
        }
      }

      if (!selectedTime) continue;

      userTradeTimes.get(firstAccount.user).push(selectedTime);
      userTradeTimes.get(secondAccount.user).push(selectedTime);

      const newTrade = {
        firstParticipant: {
          user: firstAccount.user,
          account: firstAccount._id,
          priority: selectedTime >= firstAccount.minHour && selectedTime <= firstAccount.maxHour ? "high" : "low",
          progress: firstAccount.progress,
          status: "pending",
        },
        secondParticipant: {
          user: secondAccount.user,
          account: secondAccount._id,
          priority: selectedTime >= secondAccount.minHour && selectedTime <= secondAccount.maxHour ? "high" : "low",
          progress: secondAccount.progress,
          status: "pending",
        },
        openTime: null,
        status: "pending",
        priority: "",
      };

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
      openTime.setUTCMinutes(openTime.getUTCMinutes() + selectedTime);

      if (newTrade.firstParticipant.priority === "high" && newTrade.secondParticipant.priority === "high") newTrade.priority = "high";
      if (newTrade.firstParticipant.priority === "low" && newTrade.secondParticipant.priority === "low") newTrade.priority = "low";
      if (newTrade.firstParticipant.priority !== newTrade.secondParticipant.priority) newTrade.priority = "medium";

      newTrade.openTime = openTime;
      firstAccount.matched = true;
      secondAccount.matched = true;
      trades.push(newTrade);
    }
  }
  console.log("Trades μετά τον πέμπτο κύκλο: ", trades.length);

  // --> Ίδιο phase, Άλλες Ώρες, progress 2
  const progressCycle3 = 2;
  for (let i = 0; i < updatedAccounts.length; i++) {
    const firstAccount = updatedAccounts[i];
    if (!firstAccount.flexibleTradesSuggestions) continue;
    for (let j = 0; j < updatedAccounts.length; j++) {
      if (i === j) continue;
      if (firstAccount.matched) continue;
      const secondAccount = updatedAccounts[j];
      if (firstAccount.user === secondAccount.user) continue;
      if (!secondAccount.flexibleTradesSuggestions) continue;
      if (firstAccount.capital < secondAccount.capital * 0.5 || firstAccount.capital > secondAccount.capital * 1.5) continue;
      if (secondAccount.matched) continue;
      if (firstAccount.company === secondAccount.company) continue;
      if (firstAccount.phase !== secondAccount.phase) continue;
      if (Math.abs(firstAccount.progress - secondAccount.progress) > progressCycle3) continue;
      const availableMinutes = AvailableMinutes(firstAccount.user, firstAccount.minHour, firstAccount.maxHour, secondAccount.user, secondAccount.minHour, secondAccount.maxHour, false);
      if (!availableMinutes || availableMinutes.length === 0) continue;

      // --> Βρίσκουμε την βέλτιστη δυνατή ώρα για τον user
      let selectedTime;
      if (firstAccount.timePreference === "Early Hours" && secondAccount.timePreference === "Early Hours") {
        // Επιλέγει τυχαία από τις πρώτες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
        selectedTime = availableMinutes[Math.floor(Math.random() * Math.min(5, availableMinutes.length))];
      }

      if (firstAccount.timePreference === "Late Hours" && secondAccount.timePreference === "Late Hours") {
        // Επιλέγει τυχαία από τις τελευταίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
        let startIndex = Math.max(0, availableMinutes.length - 5);
        selectedTime = availableMinutes[startIndex + Math.floor(Math.random() * (availableMinutes.length - startIndex))];
      }
      if (firstAccount.timePreference !== secondAccount.timePreference) {
        if (firstAccount.modePreference === "Condescending" || secondAccount.modePreference === "Condescending") {
          // Επιλέγει τυχαία από τις μεσαίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
          let midStart = Math.max(0, Math.floor((availableMinutes.length - 5) / 2));
          selectedTime = availableMinutes[midStart + Math.floor(Math.random() * Math.min(5, availableMinutes.length - midStart))];
        } else {
          // Επιλέγει τυχαία από τις πρώτες 5 ή τελευταίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
          if (Math.random() < 0.5) {
            selectedTime = availableMinutes[Math.floor(Math.random() * Math.min(5, availableMinutes.length))]; // Από τις πρώτες 5
          } else {
            let startIndex = Math.max(0, availableMinutes.length - 5);
            selectedTime = availableMinutes[startIndex + Math.floor(Math.random() * (availableMinutes.length - startIndex))]; // Από τις τελευταίες 5
          }
        }
      }

      if (!selectedTime) continue;

      userTradeTimes.get(firstAccount.user).push(selectedTime);
      userTradeTimes.get(secondAccount.user).push(selectedTime);

      const newTrade = {
        firstParticipant: {
          user: firstAccount.user,
          account: firstAccount._id,
          priority: selectedTime >= firstAccount.minHour && selectedTime <= firstAccount.maxHour ? "high" : "low",
          progress: firstAccount.progress,
          status: "pending",
        },
        secondParticipant: {
          user: secondAccount.user,
          account: secondAccount._id,
          priority: selectedTime >= secondAccount.minHour && selectedTime <= secondAccount.maxHour ? "high" : "low",
          progress: secondAccount.progress,
          status: "pending",
        },
        openTime: null,
        status: "pending",
        priority: "",
      };
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
      openTime.setUTCMinutes(openTime.getUTCMinutes() + selectedTime);
      if (newTrade.firstParticipant.priority === "high" && newTrade.secondParticipant.priority === "high") newTrade.priority = "high";
      if (newTrade.firstParticipant.priority === "low" && newTrade.secondParticipant.priority === "low") newTrade.priority = "low";
      if (newTrade.firstParticipant.priority !== newTrade.secondParticipant.priority) newTrade.priority = "medium";

      newTrade.openTime = openTime;
      firstAccount.matched = true;
      secondAccount.matched = true;
      trades.push(newTrade);
      //return NextResponse.json({ data: newTrade }, { status: 200 });
    }
  }
  console.log("Trades μετά τον δεύτερο κύκλο: ", trades.length);
  // --> Ίδιο phase, Άλλες Ώρες, progress 5
  const progressCycle4 = 5;
  for (let i = 0; i < updatedAccounts.length; i++) {
    const firstAccount = updatedAccounts[i];
    if (!firstAccount.flexibleTradesSuggestions) continue;
    for (let j = 0; j < updatedAccounts.length; j++) {
      if (i === j) continue;
      if (firstAccount.matched) continue;
      const secondAccount = updatedAccounts[j];
      if (firstAccount.user === secondAccount.user) continue;
      if (!secondAccount.flexibleTradesSuggestions) continue;
      if (firstAccount.capital < secondAccount.capital * 0.5 || firstAccount.capital > secondAccount.capital * 1.5) continue;
      if (secondAccount.matched) continue;
      if (firstAccount.company === secondAccount.company) continue;
      if (firstAccount.phase !== secondAccount.phase) continue;
      if (Math.abs(firstAccount.progress - secondAccount.progress) > progressCycle4) continue;

      const availableMinutes = AvailableMinutes(firstAccount.user, firstAccount.minHour, firstAccount.maxHour, secondAccount.user, secondAccount.minHour, secondAccount.maxHour, false);
      if (!availableMinutes || availableMinutes.length === 0) continue;

      // --> Βρίσκουμε την βέλτιστη δυνατή ώρα για τον user
      let selectedTime;
      if (firstAccount.timePreference === "Early Hours" && secondAccount.timePreference === "Early Hours") {
        // Επιλέγει τυχαία από τις πρώτες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
        selectedTime = availableMinutes[Math.floor(Math.random() * Math.min(5, availableMinutes.length))];
      }
      if (firstAccount.timePreference === "Late Hours" && secondAccount.timePreference === "Late Hours") {
        // Επιλέγει τυχαία από τις τελευταίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
        let startIndex = Math.max(0, availableMinutes.length - 5);
        selectedTime = availableMinutes[startIndex + Math.floor(Math.random() * (availableMinutes.length - startIndex))];
      }
      if (firstAccount.timePreference !== secondAccount.timePreference) {
        if (firstAccount.modePreference === "Condescending" || secondAccount.modePreference === "Condescending") {
          // Επιλέγει τυχαία από τις μεσαίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
          let midStart = Math.max(0, Math.floor((availableMinutes.length - 5) / 2));
          selectedTime = availableMinutes[midStart + Math.floor(Math.random() * Math.min(5, availableMinutes.length - midStart))];
        } else {
          // Επιλέγει τυχαία από τις πρώτες 5 ή τελευταίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
          if (Math.random() < 0.5) {
            selectedTime = availableMinutes[Math.floor(Math.random() * Math.min(5, availableMinutes.length))]; // Από τις πρώτες 5
          } else {
            let startIndex = Math.max(0, availableMinutes.length - 5);
            selectedTime = availableMinutes[startIndex + Math.floor(Math.random() * (availableMinutes.length - startIndex))]; // Από τις τελευταίες 5
          }
        }
      }

      if (!selectedTime) continue;

      userTradeTimes.get(firstAccount.user).push(selectedTime);
      userTradeTimes.get(secondAccount.user).push(selectedTime);

      const newTrade = {
        firstParticipant: {
          user: firstAccount.user,
          account: firstAccount._id,
          priority: selectedTime >= firstAccount.minHour && selectedTime <= firstAccount.maxHour ? "high" : "low",
          progress: firstAccount.progress,
          status: "pending",
        },
        secondParticipant: {
          user: secondAccount.user,
          account: secondAccount._id,
          priority: selectedTime >= secondAccount.minHour && selectedTime <= secondAccount.maxHour ? "high" : "low",
          progress: secondAccount.progress,
          status: "pending",
        },
        openTime: null,
        status: "pending",
        priority: "",
      };

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
      openTime.setUTCMinutes(openTime.getUTCMinutes() + selectedTime);

      if (newTrade.firstParticipant.priority === "high" && newTrade.secondParticipant.priority === "high") newTrade.priority = "high";
      if (newTrade.firstParticipant.priority === "low" && newTrade.secondParticipant.priority === "low") newTrade.priority = "low";
      if (newTrade.firstParticipant.priority !== newTrade.secondParticipant.priority) newTrade.priority = "medium";

      newTrade.openTime = openTime;
      firstAccount.matched = true;
      secondAccount.matched = true;
      trades.push(newTrade);
    }
  }

  // --> Κοινές ώρες
  for (let i = 0; i < updatedAccounts.length; i++) {
    const firstAccount = updatedAccounts[i];
    for (let j = 0; j < updatedAccounts.length; j++) {
      if (firstAccount.matched) continue;
      if (i === j) continue;
      const secondAccount = updatedAccounts[j];
      if (firstAccount.user === secondAccount.user) continue;
      if (secondAccount.matched) continue;
      if (firstAccount.capital < secondAccount.capital * 0.5 || firstAccount.capital > secondAccount.capital * 1.5) continue;
      if (firstAccount.company === secondAccount.company) continue;

      const availableMinutes = AvailableMinutes(firstAccount.user, firstAccount.minHour, firstAccount.maxHour, secondAccount.user, secondAccount.minHour, secondAccount.maxHour, true);
      if (!availableMinutes || availableMinutes.length === 0) continue;

      // --> Βρίσκουμε την βέλτιστη δυνατή ώρα για τον user
      let selectedTime;
      if (firstAccount.timePreference === "Early Hours" && secondAccount.timePreference === "Early Hours") {
        // Επιλέγει τυχαία από τις πρώτες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
        selectedTime = availableMinutes[Math.floor(Math.random() * Math.min(5, availableMinutes.length))];
      } else if (firstAccount.timePreference === "Late Hours" && secondAccount.timePreference === "Late Hours") {
        // Επιλέγει τυχαία από τις τελευταίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
        let startIndex = Math.max(0, availableMinutes.length - 5);
        selectedTime = availableMinutes[startIndex + Math.floor(Math.random() * (availableMinutes.length - startIndex))];
      } else if (firstAccount.timePreference !== secondAccount.timePreference) {
        if (firstAccount.modePreference === "Condescending" || secondAccount.modePreference === "Condescending") {
          // Επιλέγει τυχαία από τις μεσαίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
          let midStart = Math.max(0, Math.floor((availableMinutes.length - 5) / 2));
          selectedTime = availableMinutes[midStart + Math.floor(Math.random() * Math.min(5, availableMinutes.length - midStart))];
        } else {
          // Επιλέγει τυχαία από τις πρώτες 5 ή τελευταίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
          if (Math.random() < 0.5) {
            selectedTime = availableMinutes[Math.floor(Math.random() * Math.min(5, availableMinutes.length))]; // Από τις πρώτες 5
          } else {
            let startIndex = Math.max(0, availableMinutes.length - 5);
            selectedTime = availableMinutes[startIndex + Math.floor(Math.random() * (availableMinutes.length - startIndex))]; // Από τις τελευταίες 5
          }
        }
      }

      if (!selectedTime) continue;

      userTradeTimes.get(firstAccount.user).push(selectedTime);
      userTradeTimes.get(secondAccount.user).push(selectedTime);

      const newTrade = {
        firstParticipant: {
          user: firstAccount.user,
          account: firstAccount._id,
          priority: selectedTime >= firstAccount.minHour && selectedTime <= firstAccount.maxHour ? "high" : "low",
          progress: firstAccount.progress,
          status: "pending",
        },
        secondParticipant: {
          user: secondAccount.user,
          account: secondAccount._id,
          priority: selectedTime >= secondAccount.minHour && selectedTime <= secondAccount.maxHour ? "high" : "low",
          progress: secondAccount.progress,
          status: "pending",
        },
        openTime: null,
        status: "pending",
        priority: "",
      };

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
      openTime.setUTCMinutes(openTime.getUTCMinutes() + selectedTime);

      if (newTrade.firstParticipant.priority === "high" && newTrade.secondParticipant.priority === "high") newTrade.priority = "high";
      if (newTrade.firstParticipant.priority === "low" && newTrade.secondParticipant.priority === "low") newTrade.priority = "low";
      if (newTrade.firstParticipant.priority !== newTrade.secondParticipant.priority) newTrade.priority = "medium";

      newTrade.openTime = openTime;
      firstAccount.matched = true;
      secondAccount.matched = true;
      trades.push(newTrade);
    }
  }

  /*const progressCycle15 = 10;
  for (let i = 0; i < updatedAccounts.length; i++) {
    const firstAccount = updatedAccounts[i];
    for (let j = 0; j < updatedAccounts.length; j++) {
      if (firstAccount.matched) continue;
      if (i === j) continue;
      const secondAccount = updatedAccounts[j];
      if (firstAccount.user === secondAccount.user) continue;
      if (secondAccount.matched) continue;
      if (firstAccount.capital < secondAccount.capital * 0.5 || firstAccount.capital > secondAccount.capital * 1.5) continue;
      if (firstAccount.company === secondAccount.company) continue;
      if ((firstAccount.phase === 1 && secondAccount.phase === 2) || (firstAccount.phase === 2 && secondAccount.phase === 1)) continue;
      if (Math.abs(firstAccount.progress - secondAccount.progress) > progressCycle15) continue;

      const availableMinutes = AvailableMinutes(firstAccount.user, firstAccount.minHour, firstAccount.maxHour, secondAccount.user, secondAccount.minHour, secondAccount.maxHour, true);
      if (!availableMinutes || availableMinutes.length === 0) continue;

      // --> Βρίσκουμε την βέλτιστη δυνατή ώρα για τον user
      let selectedTime;
      if (firstAccount.timePreference === "Early Hours" && secondAccount.timePreference === "Early Hours") {
        // Επιλέγει τυχαία από τις πρώτες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
        selectedTime = availableMinutes[Math.floor(Math.random() * Math.min(5, availableMinutes.length))];
      } else if (firstAccount.timePreference === "Late Hours" && secondAccount.timePreference === "Late Hours") {
        // Επιλέγει τυχαία από τις τελευταίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
        let startIndex = Math.max(0, availableMinutes.length - 5);
        selectedTime = availableMinutes[startIndex + Math.floor(Math.random() * (availableMinutes.length - startIndex))];
      } else if (firstAccount.timePreference !== secondAccount.timePreference) {
        if (firstAccount.modePreference === "Condescending" || secondAccount.modePreference === "Condescending") {
          // Επιλέγει τυχαία από τις μεσαίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
          let midStart = Math.max(0, Math.floor((availableMinutes.length - 5) / 2));
          selectedTime = availableMinutes[midStart + Math.floor(Math.random() * Math.min(5, availableMinutes.length - midStart))];
        } else {
          // Επιλέγει τυχαία από τις πρώτες 5 ή τελευταίες 5 ώρες, αλλά αν υπάρχουν λιγότερες, επιλέγει από όσες υπάρχουν
          if (Math.random() < 0.5) {
            selectedTime = availableMinutes[Math.floor(Math.random() * Math.min(5, availableMinutes.length))]; // Από τις πρώτες 5
          } else {
            let startIndex = Math.max(0, availableMinutes.length - 5);
            selectedTime = availableMinutes[startIndex + Math.floor(Math.random() * (availableMinutes.length - startIndex))]; // Από τις τελευταίες 5
          }
        }
      }

      if (!selectedTime) continue;

      userTradeTimes.get(firstAccount.user).push(selectedTime);
      userTradeTimes.get(secondAccount.user).push(selectedTime);

      const newTrade = {
        firstParticipant: {
          user: firstAccount.user,
          account: firstAccount._id,
          priority: selectedTime >= firstAccount.minHour && selectedTime <= firstAccount.maxHour ? "high" : "low",
          progress: firstAccount.progress,
          status: "pending",
        },
        secondParticipant: {
          user: secondAccount.user,
          account: secondAccount._id,
          priority: selectedTime >= secondAccount.minHour && selectedTime <= secondAccount.maxHour ? "high" : "low",
          progress: secondAccount.progress,
          status: "pending",
        },
        openTime: null,
        status: "pending",
        priority: "",
      };

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
      openTime.setUTCMinutes(openTime.getUTCMinutes() + selectedTime);

      if (newTrade.firstParticipant.priority === "high" && newTrade.secondParticipant.priority === "high") newTrade.priority = "high";
      if (newTrade.firstParticipant.priority === "low" && newTrade.secondParticipant.priority === "low") newTrade.priority = "low";
      if (newTrade.firstParticipant.priority !== newTrade.secondParticipant.priority) newTrade.priority = "medium";

      newTrade.openTime = openTime;
      firstAccount.matched = true;
      secondAccount.matched = true;
      trades.push(newTrade);
    }
  }*/

  console.log("Trades μετά τον τέταρτο κύκλο: ", trades.length);
  console.log("Συνολικά trades που δημιουργήθηκαν: ", trades.length);
  console.log("Επιτυχές MatchTrading");

  revalidatePath("/", "layout");
  await Trade.insertMany(trades);
  return NextResponse.json({ success: true });
}
