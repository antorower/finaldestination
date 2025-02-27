import { NextResponse } from "next/server";
import dbConnect from "@/dbConnect";
import Settings from "@/models/Settings";
import Account from "@/models/Account";
import Trade from "@/models/Trade";

export async function GET() {
  await dbConnect();
  console.log("Cron Job Start");

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

  // <-- Είναι η ελάχιστη διαφορά λεπτών που πρέπει να έχουν τα trades ενός trader μεταξύ τους
  // ώστε να έχει τον χρόνο να ετοιμάσει το επόμενο
  const minutesSpaceBetweenTrades = settings.minutesSpaceBetweenTrades;

  // --> Αν η μέρα δεν είναι active σταματάει η διαδικασία
  if (!settings[today]?.active) {
    console.log("Η ημέρα δεν είναι active");
    return NextResponse.json({ stoped: true }, { status: 200 });
  }

  // --> Τραβάει όλα τα accounts που δεν θέλει update το balance τους, δεν είναι isOnBoarding και το status τους είναι Live
  // --> Το match: { accepted: true, status: "active" } δεν θα φέρει το user που δεν είναι accepted και active
  const requestedAccounts = await Account.find({
    needBalanceUpdate: false,
    isOnBoarding: false,
    status: "Live",
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
    .lean();

  function generateRandomAccounts(numEntries) {
    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateObjectId() {
      return Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10);
    }

    // Σταθερά IDs για τις εταιρείες
    const companies = [
      { _id: "65fcbadf1a3e4b001c4f6a01", name: "FTMO" },
      { _id: "65fcbadf1a3e4b001c4f6a02", name: "The5ers" },
      { _id: "65fcbadf1a3e4b001c4f6a03", name: "Funding Pips" },
      { _id: "65fcbadf1a3e4b001c4f6a04", name: "Funded Next" },
    ];

    const numUsers = Math.max(1, Math.floor(numEntries / 4));

    // Δημιουργούμε users με σταθερά trading hours
    const users = Array.from({ length: numUsers }, () => {
      const startingHour = getRandomInt(4, 9);
      const endingHour = getRandomInt(startingHour + 1, 10);
      return {
        _id: generateObjectId(),
        tradingHours: {
          startingTradingHour: startingHour,
          endingTradingHour: endingHour,
        },
      };
    });

    const accounts = [];

    for (let i = 0; i < numEntries; i++) {
      const phase = getRandomInt(1, 3);
      let balanceRange = { 1: [90000, 108000], 2: [90000, 105000], 3: [90000, 102000] };
      let company = companies[i % companies.length]; // Κρατάμε σταθερά τα IDs των εταιρειών
      let user = users[getRandomInt(0, numUsers - 1)]; // Επιλέγουμε έναν user

      accounts.push({
        _id: generateObjectId(),
        phase: phase,
        balance: getRandomInt(balanceRange[phase][0], balanceRange[phase][1]),
        capital: 100000,
        timePreference: Math.random() < 0.5 ? "Early Hours" : "Late Hours",
        modePreference: Math.random() < 0.5 ? "Boundaries" : "Condescending",
        user: {
          _id: user._id,
          tradingHours: user.tradingHours, // Χρησιμοποιεί τα ίδια trading hours
        },
        company: {
          _id: company._id,
          name: company.name,
          phase1: { target: 8, totalDrawdown: 10 },
          phase2: { target: 5, totalDrawdown: 10 },
          phase3: { target: 2, totalDrawdown: 10 },
        },
      });
    }

    return accounts;
  }

  /*const requestedAccounts = generateRandomAccounts(50);*/

  // --> Ελέγχω αν το array των accounts είναι άδειο
  if (!requestedAccounts || requestedAccounts.length === 0) {
    console.log("Το array requestedAccounts είναι άδειο");
    return NextResponse.json({ stoped: true }, { status: 500 });
  }

  // --> Αυτό κρατάει μόνο τα accounts που έχουν user
  const filteredAccounts = requestedAccounts.filter((account) => account.user !== null);
  if (!filteredAccounts || filteredAccounts.length === 0) {
    console.log("Το array filteredAccounts είναι άδειο");
    return NextResponse.json({ stoped: true }, { status: 500 });
  }

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
  updatedAccounts.sort((a, b) => a.progress - b.progress);

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

  // --> Κύκλος 1: Κοινές ώρες, ίδιο phase, progress 2
  const trades = [];
  const progressCycle1 = 2;
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
      if (firstAccount.phase !== secondAccount.phase) continue;
      if (Math.abs(firstAccount.progress - secondAccount.progress) > progressCycle1) continue;

      const availableMinutes = AvailableMinutes(firstAccount.user, firstAccount.minHour, firstAccount.maxHour, secondAccount.user, secondAccount.minHour, secondAccount.maxHour, true);
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
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1); // Αυριανή ημερομηνία
      tomorrow.setUTCHours(0, 0, 0, 0); // Ξεκινάμε από τα μεσάνυχτα UTC

      // Υπολογίζουμε αν ισχύει θερινή ώρα (DST)
      const greeceOffset = now.getTimezoneOffset() === -180 ? 180 : 120; // UTC+3 (θερινή ώρα) ή UTC+2 (χειμερινή ώρα)

      // Μετατροπή του `tomorrow` στην ώρα Ελλάδας
      tomorrow.setUTCMinutes(tomorrow.getUTCMinutes() - greeceOffset);

      tomorrow.setUTCMinutes(tomorrow.getUTCMinutes() + selectedTime);
      //console.log(tomorrow.toISOString());

      if (newTrade.firstParticipant.priority === "high" && newTrade.secondParticipant.priority === "high") newTrade.priority = "high";
      if (newTrade.firstParticipant.priority === "low" && newTrade.secondParticipant.priority === "low") newTrade.priority = "low";
      if (newTrade.firstParticipant.priority !== newTrade.secondParticipant.priority) newTrade.priority = "medium";

      firstAccount.matched = true;
      secondAccount.matched = true;
      trades.push(newTrade);
    }
  }
  console.log(trades.length);

  // --> Κύκλος 3: Ίδιο phase, progress 2
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
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1); // Αυριανή ημερομηνία
      tomorrow.setUTCHours(0, 0, 0, 0); // Ξεκινάμε από τα μεσάνυχτα UTC

      // Υπολογίζουμε αν ισχύει θερινή ώρα (DST)
      const greeceOffset = now.getTimezoneOffset() === -180 ? 180 : 120; // UTC+3 (θερινή ώρα) ή UTC+2 (χειμερινή ώρα)

      // Μετατροπή του `tomorrow` στην ώρα Ελλάδας
      tomorrow.setUTCMinutes(tomorrow.getUTCMinutes() - greeceOffset);

      tomorrow.setUTCMinutes(tomorrow.getUTCMinutes() + selectedTime);
      //console.log(tomorrow.toISOString());

      if (newTrade.firstParticipant.priority === "high" && newTrade.secondParticipant.priority === "high") newTrade.priority = "high";
      if (newTrade.firstParticipant.priority === "low" && newTrade.secondParticipant.priority === "low") newTrade.priority = "low";
      if (newTrade.firstParticipant.priority !== newTrade.secondParticipant.priority) newTrade.priority = "medium";

      firstAccount.matched = true;
      secondAccount.matched = true;
      trades.push(newTrade);
    }
  }
  console.log(trades.length);

  // --> Κύκλος 2: Κοινές ώρες, ίδιο phase, progress 5
  const progressCycle2 = 5;
  for (let i = 0; i < updatedAccounts.length; i++) {
    const firstAccount = updatedAccounts[i];
    for (let j = 0; j < updatedAccounts.length; j++) {
      if (i === j) continue;
      if (firstAccount.matched) continue;
      const secondAccount = updatedAccounts[j];
      if (firstAccount.user === secondAccount.user) continue;
      if (firstAccount.capital < secondAccount.capital * 0.5 || firstAccount.capital > secondAccount.capital * 1.5) continue;
      if (secondAccount.matched) continue;
      if (firstAccount.company === secondAccount.company) continue;
      if (firstAccount.phase !== secondAccount.phase) continue;
      if (Math.abs(firstAccount.progress - secondAccount.progress) > progressCycle2) continue;

      const availableMinutes = AvailableMinutes(firstAccount.user, firstAccount.minHour, firstAccount.maxHour, secondAccount.user, secondAccount.minHour, secondAccount.maxHour, true);
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
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1); // Αυριανή ημερομηνία
      tomorrow.setUTCHours(0, 0, 0, 0); // Ξεκινάμε από τα μεσάνυχτα UTC

      // Υπολογίζουμε αν ισχύει θερινή ώρα (DST)
      const greeceOffset = now.getTimezoneOffset() === -180 ? 180 : 120; // UTC+3 (θερινή ώρα) ή UTC+2 (χειμερινή ώρα)

      // Μετατροπή του `tomorrow` στην ώρα Ελλάδας
      tomorrow.setUTCMinutes(tomorrow.getUTCMinutes() - greeceOffset);

      tomorrow.setUTCMinutes(tomorrow.getUTCMinutes() + selectedTime);
      //console.log(tomorrow.toISOString());

      if (newTrade.firstParticipant.priority === "high" && newTrade.secondParticipant.priority === "high") newTrade.priority = "high";
      if (newTrade.firstParticipant.priority === "low" && newTrade.secondParticipant.priority === "low") newTrade.priority = "low";
      if (newTrade.firstParticipant.priority !== newTrade.secondParticipant.priority) newTrade.priority = "medium";

      firstAccount.matched = true;
      secondAccount.matched = true;
      trades.push(newTrade);
    }
  }
  console.log(trades.length);

  // --> Κύκλος 4: Ίδιο phase, progress 5
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
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1); // Αυριανή ημερομηνία
      tomorrow.setUTCHours(0, 0, 0, 0); // Ξεκινάμε από τα μεσάνυχτα UTC

      // Υπολογίζουμε αν ισχύει θερινή ώρα (DST)
      const greeceOffset = now.getTimezoneOffset() === -180 ? 180 : 120; // UTC+3 (θερινή ώρα) ή UTC+2 (χειμερινή ώρα)

      // Μετατροπή του `tomorrow` στην ώρα Ελλάδας
      tomorrow.setUTCMinutes(tomorrow.getUTCMinutes() - greeceOffset);

      tomorrow.setUTCMinutes(tomorrow.getUTCMinutes() + selectedTime);
      //console.log(tomorrow.toISOString());

      if (newTrade.firstParticipant.priority === "high" && newTrade.secondParticipant.priority === "high") newTrade.priority = "high";
      if (newTrade.firstParticipant.priority === "low" && newTrade.secondParticipant.priority === "low") newTrade.priority = "low";
      if (newTrade.firstParticipant.priority !== newTrade.secondParticipant.priority) newTrade.priority = "medium";

      firstAccount.matched = true;
      secondAccount.matched = true;
      trades.push(newTrade);
    }
  }
  console.log(trades.length);
  console.log("GO GO GO GO GO");
  await Trade.insertMany(trades);
  return NextResponse.json({ trades });
}
