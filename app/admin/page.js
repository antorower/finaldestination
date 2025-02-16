import Menu from "@/components/Menu";
import MatchMakingButton from "@/components/MatchMakingButton";
import dbConnect from "@/dbConnect";
import { revalidatePath } from "next/cache";
import Account from "@/models/Account";
import Trade from "@/models/Trade";
import { progress } from "framer-motion";

const MatchMaking2 = async () => {
  "use server";
  try {
    dbConnect();

    // Settings Αλγορίθμου
    const minutesBetweenTrades = 12;

    // Βρίσκω όλα τα accounts που είναι ενημερωμένα, έχουν status === "Live" και δεν είναι isOnBoarding
    // Επίσης ο user έχει γίνει accepted και έχει active status
    const requestedAccounts = await Account.find({
      needBalanceUpdate: false,
      isOnBoarding: false,
      status: "Live",
    })
      .select("phase balance capital") // Επιλέγουμε μόνο αυτά τα πεδία από το Account
      .populate({
        path: "user",
        select: "_id tradingHours", // Φέρνουμε μόνο αυτά τα πεδία από το user
        match: { accepted: true, status: "active" }, // Φιλτράρουμε μόνο τους αποδεκτούς και ενεργούς users
      })
      .populate({
        path: "company",
        select: "phases", // Φέρνουμε μόνο αυτά τα πεδία από το company
      })
      .lean();

    // Φιλτράρω τα accounts ώστε όσα έχουν null user (δηλαδή δεν πληρεί τα match κριτίρα accepted: true, status: "active") να φύγουν
    const filteredAccounts = requestedAccounts.filter((account) => account.user !== null);

    // Map με όλους τους μοναδικούς users
    const users = new Map(
      filteredAccounts.map((account) => {
        const userData = {
          tradingHours: {
            minHour: account.user.tradingHours.startingTradingHour * 60,
            maxHour: account.user.tradingHours.endingTradingHour * 60,
          },
          times: [],
        };

        return [account.user._id.toString(), userData];
      })
    );

    // Προσθέτω τα matchmakingData στο object για τις ανάγκες του matchMaking
    const updatedAccounts = filteredAccounts.map((account) => {
      const progress = Math.round(((account.balance - account.capital) / ((account.company.phases[account.phase - 1].target / 100) * account.capital)) * 100);
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
      };
    });

    //await Trade.insertMany(trades);
  } catch (error) {
    console.log(error);
    return false;
  }
};
// Matchmaking function
const MatchMakingNew = async () => {
  "use server";
  try {
    dbConnect();

    // Settings Αλγορίθμου
    const minTimeGap = 10; // Ελάχιστο διάστημα 10 λεπτών ανάμεσα σε trades του ίδιου user

    // Βρίσκω όλα τα accounts που είναι ενημερωμένα, έχουν status === "Live" και δεν είναι isOnBoarding
    // Επίσης ο user έχει γίνει accepted και έχει active status
    const requestedAccounts2 = await Account.find({
      needBalanceUpdate: false,
      isOnBoarding: false,
      status: "Live",
    })
      .select("phase balance capital") // Επιλέγουμε μόνο αυτά τα πεδία από το Account
      .populate({
        path: "user",
        select: "_id tradingHours", // Φέρνουμε μόνο αυτά τα πεδία από το user
        match: { accepted: true, status: "active" }, // Φιλτράρουμε μόνο τους αποδεκτούς και ενεργούς users
      })
      .populate({
        path: "company",
        select: "phases", // Φέρνουμε μόνο αυτά τα πεδία από το company
      })
      .lean();

    // Φιλτράρω τα accounts ώστε όσα έχουν null user (δηλαδή δεν πληρεί τα match κριτίρα accepted: true, status: "active") να φύγουν
    const filteredAccounts = requestedAccounts.filter((account) => account.user !== null);

    // Map με όλους τους μοναδικούς users και τα tradingHours τους
    const users = new Map(
      filteredAccounts.map((account) => {
        return [
          account.user._id.toString(),
          {
            tradingHours: {
              minHour: account.user.tradingHours.startingTradingHour * 60,
              maxHour: account.user.tradingHours.endingTradingHour * 60,
            },
            times: [], // Θα αποθηκεύουμε εδώ τις ώρες των trades ώστε να τηρούμε τον περιορισμό των 10 λεπτών
          },
        ];
      })
    );

    // Δημιουργία updatedAccounts array με επιπλέον δεδομένα που θα χρειαστούμε στο matchmaking
    const updatedAccounts = filteredAccounts.map((account) => {
      const progress = Math.round(((account.balance - account.capital) / ((account.company.phases[account.phase - 1].target / 100) * account.capital)) * 100);
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
      };
    });

    // Συνάρτηση για εύρεση των matching accounts και επιλογή κοινής ώρας trade
    const findMatchingAccounts = (accounts, ignoreTime = false) => {
      let matchedAccounts = new Set();
      let trades = [];

      for (let i = 0; i < accounts.length; i++) {
        for (let j = i + 1; j < accounts.length; j++) {
          let acc1 = accounts[i];
          let acc2 = accounts[j];

          let samePhase = acc1.phase === acc2.phase;
          let diffCompany = acc1.company !== acc2.company;
          let diffUser = acc1.user !== acc2.user;
          let progressDiff = Math.abs(acc1.progress - acc2.progress) <= 20;
          let commonTime = ignoreTime || Math.max(acc1.minHour, acc2.minHour) < Math.min(acc1.maxHour, acc2.maxHour);

          if (samePhase && diffCompany && diffUser && progressDiff && commonTime) {
            let priority1 = acc1.minHour <= acc2.minHour && acc2.minHour <= acc1.maxHour ? "high" : "low";
            let priority2 = acc2.minHour <= acc1.minHour && acc1.minHour <= acc2.maxHour ? "high" : "low";
            let tradePriority = priority1 === "high" && priority2 === "high" ? "high" : priority1 === "high" || priority2 === "high" ? "medium" : "low";

            // Επιλογή κοινής ώρας trade, με έλεγχο για το minTimeGap των 10 λεπτών
            let tradeTime = Math.max(acc1.minHour, acc2.minHour);
            while (users.get(acc1.user).times.includes(tradeTime) || users.get(acc2.user).times.includes(tradeTime)) {
              tradeTime += minTimeGap;
            }
            users.get(acc1.user).times.push(tradeTime);
            users.get(acc2.user).times.push(tradeTime);

            trades.push({
              firstParticipant: {
                user: acc1.user,
                account: acc1._id,
                trade: { time: tradeTime },
                priority: priority1,
                status: "pending",
              },
              secondParticipant: {
                user: acc2.user,
                account: acc2._id,
                trade: { time: tradeTime },
                priority: priority2,
                status: "pending",
              },
              status: "pending",
              cancelable: true,
              priority: tradePriority,
            });

            matchedAccounts.add(acc1._id);
            matchedAccounts.add(acc2._id);
          }
        }
      }
      return { trades, matchedAccounts };
    };

    // Πρώτο πέρασμα: Ταίριασμα accounts με κοινό ωράριο
    let { trades, matchedAccounts } = findMatchingAccounts(updatedAccounts);

    // Δεύτερο πέρασμα: Ταίριασμα accounts αγνοώντας τις ώρες για όσα δεν έχουν βρει match
    let unmatchedAccounts = updatedAccounts.filter((acc) => !matchedAccounts.has(acc._id));
    let { trades: extraTrades } = findMatchingAccounts(unmatchedAccounts, true);
    trades.push(...extraTrades);

    // Αποθήκευση των trades στη βάση δεδομένων

    //await Trade.insertMany(trades);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const requestedAccountsMock = [
  {
    _id: "1",
    phase: 2,
    balance: 96274,
    capital: 100000,
    user: {
      _id: "user1",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyY",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "2",
    phase: 3,
    balance: 90020,
    capital: 100000,
    user: {
      _id: "user2",
      tradingHours: {
        startingTradingHour: 7,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyZ",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "3",
    phase: 3,
    balance: 96046,
    capital: 100000,
    user: {
      _id: "user3",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 9,
      },
    },
    company: {
      _id: "companyZ",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "4",
    phase: 2,
    balance: 102035,
    capital: 100000,
    user: {
      _id: "user1",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyY",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "5",
    phase: 3,
    balance: 96484,
    capital: 100000,
    user: {
      _id: "user2",
      tradingHours: {
        startingTradingHour: 7,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyB",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "6",
    phase: 3,
    balance: 96053,
    capital: 100000,
    user: {
      _id: "user3",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 9,
      },
    },
    company: {
      _id: "companyX",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "7",
    phase: 3,
    balance: 96940,
    capital: 100000,
    user: {
      _id: "user1",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyB",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "8",
    phase: 1,
    balance: 99500,
    capital: 100000,
    user: {
      _id: "user2",
      tradingHours: {
        startingTradingHour: 7,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyZ",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "9",
    phase: 2,
    balance: 95396,
    capital: 100000,
    user: {
      _id: "user3",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 9,
      },
    },
    company: {
      _id: "companyB",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "10",
    phase: 1,
    balance: 107743,
    capital: 100000,
    user: {
      _id: "user1",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyX",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "11",
    phase: 2,
    balance: 104605,
    capital: 100000,
    user: {
      _id: "user2",
      tradingHours: {
        startingTradingHour: 7,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyY",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "12",
    phase: 3,
    balance: 93881,
    capital: 100000,
    user: {
      _id: "user3",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 9,
      },
    },
    company: {
      _id: "companyY",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "13",
    phase: 1,
    balance: 99481,
    capital: 100000,
    user: {
      _id: "user1",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyZ",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "14",
    phase: 3,
    balance: 100697,
    capital: 100000,
    user: {
      _id: "user2",
      tradingHours: {
        startingTradingHour: 7,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyX",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "15",
    phase: 1,
    balance: 90794,
    capital: 100000,
    user: {
      _id: "user3",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 9,
      },
    },
    company: {
      _id: "companyA",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "16",
    phase: 3,
    balance: 101509,
    capital: 100000,
    user: {
      _id: "user1",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyZ",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "17",
    phase: 2,
    balance: 90814,
    capital: 100000,
    user: {
      _id: "user2",
      tradingHours: {
        startingTradingHour: 7,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyZ",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "18",
    phase: 2,
    balance: 98724,
    capital: 100000,
    user: {
      _id: "user3",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 9,
      },
    },
    company: {
      _id: "companyX",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "19",
    phase: 1,
    balance: 103284,
    capital: 100000,
    user: {
      _id: "user1",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyA",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "20",
    phase: 2,
    balance: 103434,
    capital: 100000,
    user: {
      _id: "user2",
      tradingHours: {
        startingTradingHour: 7,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyZ",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "21",
    phase: 2,
    balance: 101591,
    capital: 100000,
    user: {
      _id: "user3",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 9,
      },
    },
    company: {
      _id: "companyZ",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "22",
    phase: 1,
    balance: 97181,
    capital: 100000,
    user: {
      _id: "user1",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyX",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "23",
    phase: 2,
    balance: 98385,
    capital: 100000,
    user: {
      _id: "user2",
      tradingHours: {
        startingTradingHour: 7,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyX",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "24",
    phase: 3,
    balance: 97570,
    capital: 100000,
    user: {
      _id: "user3",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 9,
      },
    },
    company: {
      _id: "companyY",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "25",
    phase: 1,
    balance: 99246,
    capital: 100000,
    user: {
      _id: "user1",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyB",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "26",
    phase: 2,
    balance: 101463,
    capital: 100000,
    user: {
      _id: "user2",
      tradingHours: {
        startingTradingHour: 7,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyX",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "27",
    phase: 3,
    balance: 90614,
    capital: 100000,
    user: {
      _id: "user3",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 9,
      },
    },
    company: {
      _id: "companyA",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "28",
    phase: 3,
    balance: 94497,
    capital: 100000,
    user: {
      _id: "user2",
      tradingHours: {
        startingTradingHour: 7,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyA",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "29",
    phase: 2,
    balance: 99262,
    capital: 100000,
    user: {
      _id: "user1",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyX",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "30",
    phase: 2,
    balance: 91644,
    capital: 100000,
    user: {
      _id: "user2",
      tradingHours: {
        startingTradingHour: 7,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyX",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "31",
    phase: 3,
    balance: 95385,
    capital: 100000,
    user: {
      _id: "user3",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 9,
      },
    },
    company: {
      _id: "companyY",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "32",
    phase: 3,
    balance: 99282,
    capital: 100000,
    user: {
      _id: "user1",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyB",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "33",
    phase: 2,
    balance: 95816,
    capital: 100000,
    user: {
      _id: "user2",
      tradingHours: {
        startingTradingHour: 7,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyX",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "34",
    phase: 1,
    balance: 93182,
    capital: 100000,
    user: {
      _id: "user3",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 9,
      },
    },
    company: {
      _id: "companyY",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
  {
    _id: "35",
    phase: 2,
    balance: 95866,
    capital: 100000,
    user: {
      _id: "user1",
      tradingHours: {
        startingTradingHour: 5,
        endingTradingHour: 10,
      },
    },
    company: {
      _id: "companyB",
      phases: [{ target: 10 }, { target: 8 }, { target: 5 }],
    },
  },
];

const MatchMaking = async () => {
  "use server";
  try {
    dbConnect();

    // Settings Αλγορίθμου
    const minTimeGap = 10; // Ελάχιστο διάστημα 10 λεπτών ανάμεσα σε trades του ίδιου user
    const maxProgressDiff = 20;

    // Βρίσκω όλα τα accounts που είναι ενημερωμένα, έχουν status === "Live" και δεν είναι isOnBoarding
    // Επίσης ο user έχει γίνει accepted και έχει active status
    const requestedAccounts = await Account.find({
      needBalanceUpdate: false,
      isOnBoarding: false,
      status: "Live",
    })
      .select("phase balance capital")
      .populate({
        path: "user",
        select: "_id tradingHours",
        match: { accepted: true, status: "active" },
      })
      .populate({
        path: "company",
        select: "phases",
      })
      .lean();

    // Φιλτράρω τα accounts ώστε όσα έχουν null user να φύγουν
    const filteredAccounts = requestedAccounts.filter((account) => account.user !== null);

    // Map με όλους τους μοναδικούς users και τα tradingHours τους
    const users = new Map(
      filteredAccounts.map((account) => {
        return [
          account.user._id.toString(),
          {
            tradingHours: {
              minHour: account.user.tradingHours.startingTradingHour * 60,
              maxHour: account.user.tradingHours.endingTradingHour * 60,
            },
            times: [],
          },
        ];
      })
    );

    // Δημιουργία updatedAccounts array με επιπλέον δεδομένα
    const updatedAccounts = filteredAccounts.map((account) => {
      const progress = Math.round(((account.balance - account.capital) / ((account.company.phases[account.phase - 1].target / 100) * account.capital)) * 100);
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
      };
    });

    // Ταξινόμηση accounts κατά progress (ascending order)
    updatedAccounts.sort((a, b) => a.progress - b.progress);

    // Συνάρτηση για εύρεση των καλύτερων matching accounts με βάση το progress
    const findOptimizedMatchingAccounts = (accounts, ignoreTime = false) => {
      let matchedAccounts = new Set();
      let trades = [];

      while (accounts.length > 1) {
        let acc1 = accounts.shift(); // Παίρνουμε το πρώτο διαθέσιμο account
        let bestMatchIndex = -1;
        let minProgressDiff = Infinity;

        // Βρίσκουμε το account με την πιο κοντινή progress διαφορά
        for (let i = 0; i < accounts.length; i++) {
          let acc2 = accounts[i];

          if (matchedAccounts.has(acc2._id)) continue;

          let samePhase = acc1.phase === acc2.phase;
          let diffCompany = acc1.company !== acc2.company;
          let diffUser = acc1.user !== acc2.user;
          let progressDiff = Math.abs(acc1.progress - acc2.progress) <= maxProgressDiff;
          let commonTime = ignoreTime || (acc1.maxHour > acc2.minHour && acc2.maxHour > acc1.minHour);

          if (samePhase && diffCompany && diffUser && progressDiff && commonTime) {
            let diff = Math.abs(acc1.progress - acc2.progress);
            if (diff < minProgressDiff) {
              minProgressDiff = diff;
              bestMatchIndex = i;
            }
          }
        }

        if (bestMatchIndex !== -1) {
          let acc2 = accounts.splice(bestMatchIndex, 1)[0];

          let tradeTime = Math.max(acc1.minHour, acc2.minHour);

          // Συνάρτηση που ελέγχει αν μια ώρα είναι διαθέσιμη για τον χρήστη
          const isTradeTimeAvailable = (user, time) => {
            return users.get(user).times.every((t) => Math.abs(t - time) >= minTimeGap);
          };

          // Αναζητούμε έγκυρη ώρα
          while (!isTradeTimeAvailable(acc1.user, tradeTime) || !isTradeTimeAvailable(acc2.user, tradeTime)) {
            tradeTime += 1;
            if (tradeTime > Math.min(acc1.maxHour, acc2.maxHour)) {
              break; // Σταματάει αν το tradeTime ξεφύγει από το μέγιστο ωράριο
            }
          }

          // Προσθέτουμε ένα μικρό τυχαίο offset (1-3 λεπτά) για να φαίνεται πιο φυσικό
          let randomOffset = Math.floor(Math.random() * 3) + 1;
          tradeTime += randomOffset;

          // Αποθηκεύουμε τη νέα ώρα στους χρήστες
          if (users.has(acc1.user)) users.get(acc1.user).times.push(tradeTime);
          if (users.has(acc2.user)) users.get(acc2.user).times.push(tradeTime);

          // ✅ Υπολογίζουμε το priority **μετά** την τελική ώρα tradeTime
          let priority1 = acc1.minHour <= tradeTime && tradeTime <= acc1.maxHour ? "high" : "low";
          let priority2 = acc2.minHour <= tradeTime && tradeTime <= acc2.maxHour ? "high" : "low";
          let tradePriority = priority1 === "high" && priority2 === "high" ? "high" : priority1 === "high" || priority2 === "high" ? "medium" : "low";

          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1); // Μετακινούμε την ημερομηνία στην αυριανή μέρα

          trades.push({
            firstParticipant: {
              user: acc1.user,
              account: acc1._id,
              trade: {},
              priority: priority1,
              status: "pending",
            },
            secondParticipant: {
              user: acc2.user,
              account: acc2._id,
              trade: {},
              priority: priority2,
              status: "pending",
            },
            status: "pending",
            cancelable: true,
            priority: tradePriority,
            openTime: {
              year: tomorrow.getFullYear(), // Έτος (π.χ. 2025)
              month: tomorrow.getMonth() + 1, // Μήνας (π.χ. 5 για Μάιο)
              day: tomorrow.getDate(), // Ημέρα (π.χ. 17)
              dayString: tomorrow.toLocaleDateString("el-GR", { weekday: "long" }), // Ημέρα της εβδομάδας (π.χ. Τετάρτη)
              hour: Math.floor(tradeTime / 60), // Υπολογισμός ώρας
              minutes: tradeTime % 60, // Υπολογισμός λεπτών
            },
          });

          matchedAccounts.add(acc1._id);
          matchedAccounts.add(acc2._id);
        }
      }
      return { trades, matchedAccounts };
    };

    // Πρώτο πέρασμα: Ταίριασμα accounts με κοινό ωράριο
    let { trades, matchedAccounts } = findOptimizedMatchingAccounts([...updatedAccounts]);

    // Δεύτερο πέρασμα: Ταίριασμα accounts αγνοώντας τις ώρες για όσα δεν έχουν βρει match
    let unmatchedAccounts = updatedAccounts.filter((acc) => !matchedAccounts.has(acc._id));
    let { trades: extraTrades } = findOptimizedMatchingAccounts(unmatchedAccounts, true);
    trades.push(...extraTrades);

    // Αποθήκευση των trades στη βάση δεδομένων
    await Trade.insertMany(trades);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const Admin = async () => {
  await MatchMaking();

  return (
    <div className="flex flex-col gap-4 p-8">
      <Menu activeMenu="Admin" />
      <div>context</div>
      <div className="m-auto">
        <MatchMakingButton MatchMaking={MatchMaking} />
      </div>
    </div>
  );
};

export default Admin;
/*

    // Το balance που πρέπει να φτάσει για να κερδίσει
      const targetBalanceGeneral = (account.company.phases[account.phase - 1].target / 100) * account.capital + account.capital;
      // Το ποσοστό που πρέπει να πιάσει για να κερδίσει
      const targetPercentGeneral = ((targetBalanceGeneral - account.capital) / account.capital) * 100;
      // Τα κέρδη σε δολάρια που χρειάζεται όταν ξεκινάει για να κερδίσει
      const profitsNeededGeneral = targetBalanceGeneral - account.capital;
      // Τα κέρδη που έχει τώρα σε ποσοστό
      const profitPercentCurrent = ((account.balance - account.capital) / account.capital) * 100;
      // Το progress του account, δηλαδή το ποσοστό που έχει κερδίσει σε σχέση με τον στόχο
      const progress = (profitPercentCurrent * 100) / targetPercentGeneral;

      */

/*
          // Βρίσκει τα ζευγάρια που είναι σε όλα συνεπή και έχουν 5 μονάδες πάνω κάτω στο progress
    updatedAccounts.forEach((accountExternal) => {
      updatedAccounts.forEach((accountInternal) => {
        const overlapStart = Math.max(accountExternal.matchmakingData.tradingHours.startingTradingHour, accountInternal.matchmakingData.tradingHours.startingTradingHour);
        const overlapEnd = Math.min(accountExternal.matchmakingData.tradingHours.endingTradingHour, accountInternal.matchmakingData.tradingHours.endingTradingHour);
        if (overlapStart > overlapEnd) return; // Να υπάρχουν κοινές ώρες
        if (accountExternal._id.toString() === accountInternal._id.toString()) return; // Να μην είναι ίδιο account
        if (accountExternal.matchmakingData.matched) return; // Να μην είναι matched το externalAccount
        if (accountInternal.matchmakingData.matched) return; // Να μην είναι matched το internalAccount
        if (accountExternal.matchmakingData.phase !== accountInternal.matchmakingData.phase) return; // Να είναι ίδιο phase
        if (accountExternal.matchmakingData.company === accountInternal.matchmakingData.company) return; // Να είναι διαφορετικό company
        if (accountExternal.matchmakingData.progress < accountInternal.matchmakingData.progress - 5 || accountExternal.matchmakingData.progress > accountInternal.matchmakingData.progress + 5) return; // Το progress να έχει διαφορά 5 μονάδες πάνω κάτω
        const trade = {
          firstParticipant: {
            user: accountExternal.user._id.toString(),
            account: accountExternal._id.toString(),
            trade: {},
            priority: "high",
            status: "pending",
          },
          secondParticipant: {
            user: accountInternal.user._id.toString(),
            account: accountInternal._id.toString(),
            trade: {},
            priority: "high",
            status: "pending",
          },
          status: "pending",
          cancelable: true,
          priority: "high",
        };
        trades.push(trade);
        accountExternal.matchmakingData.matched = true;
        accountInternal.matchmakingData.matched = true;
      });
    });
    // Βρίσκει τα ζευγάρια που είναι σε όλα συνεπή και έχουν 10 μονάδες πάνω κάτω στο progress
    updatedAccounts.forEach((accountExternal) => {
      updatedAccounts.forEach((accountInternal) => {
        if (accountExternal._id.toString() === accountInternal._id.toString()) return; // Να μην είναι ίδιο account
        const overlapStart = Math.max(accountExternal.matchmakingData.tradingHours.startingTradingHour, accountInternal.matchmakingData.tradingHours.startingTradingHour);
        const overlapEnd = Math.min(accountExternal.matchmakingData.tradingHours.endingTradingHour, accountInternal.matchmakingData.tradingHours.endingTradingHour);
        if (accountExternal.matchmakingData.matched) return; // Να μην είναι matched το externalAccount
        if (accountInternal.matchmakingData.matched) return; // Να μην είναι matched το internalAccount
        if (overlapStart > overlapEnd) return; // Να υπάρχουν κοινές ώρες
        if (accountExternal.matchmakingData.phase !== accountInternal.matchmakingData.phase) return; // Να είναι ίδιο phase
        if (accountExternal.matchmakingData.company === accountInternal.matchmakingData.company) return; // Να είναι διαφορετικό company
        if (accountExternal.matchmakingData.progress < accountInternal.matchmakingData.progress - 10 || accountExternal.matchmakingData.progress > accountInternal.matchmakingData.progress + 10) return; // Το progress να έχει διαφορά 10 μονάδες πάνω κάτω
        const trade = {
          firstParticipant: {
            user: accountExternal.user._id.toString(),
            account: accountExternal._id.toString(),
            trade: {},
            priority: "high",
            status: "pending",
          },
          secondParticipant: {
            user: accountInternal.user._id.toString(),
            account: accountInternal._id.toString(),
            trade: {},
            priority: "high",
            status: "pending",
          },
          status: "pending",
          cancelable: true,
          priority: "high",
        };
        trades.push(trade);
        accountExternal.matchmakingData.matched = true;
        accountInternal.matchmakingData.matched = true;
      });
    });
    // Βρίσκει τα ζευγάρια που είναι σε όλα συνεπή πλην ώρας και έχουν 5 μονάδες πάνω κάτω στο progress
    updatedAccounts.forEach((accountExternal) => {
      updatedAccounts.forEach((accountInternal) => {
        if (accountExternal._id.toString() === accountInternal._id.toString()) return; // Να μην είναι ίδιο account
        if (accountExternal.matchmakingData.matched) return; // Να μην είναι matched το externalAccount
        if (accountInternal.matchmakingData.matched) return; // Να μην είναι matched το internalAccount
        if (accountExternal.matchmakingData.phase !== accountInternal.matchmakingData.phase) return; // Να είναι ίδιο phase
        if (accountExternal.matchmakingData.company === accountInternal.matchmakingData.company) return; // Να είναι διαφορετικό company
        if (accountExternal.matchmakingData.progress < accountInternal.matchmakingData.progress - 5 || accountExternal.matchmakingData.progress > accountInternal.matchmakingData.progress + 5) return; // Το progress να έχει διαφορά 5 μονάδες πάνω κάτω

        // Έλεγχος αν υπάρχει ήδη trade μεταξύ των δύο accounts
        const tradeExists = trades.some((trade) => (trade.firstParticipant.account === accountExternal._id.toString() && trade.secondParticipant.account === accountInternal._id.toString()) || (trade.firstParticipant.account === accountInternal._id.toString() && trade.secondParticipant.account === accountExternal._id.toString()));
        // Αν υπάρχει ήδη, δεν το προσθέτουμε ξανά
        if (tradeExists) return;

        const trade = {
          firstParticipant: {
            user: accountExternal.user._id.toString(),
            account: accountExternal._id.toString(),
            trade: {},
            priority: "low",
            status: "pending",
          },
          secondParticipant: {
            user: accountInternal.user._id.toString(),
            account: accountInternal._id.toString(),
            trade: {},
            priority: "low",
            status: "pending",
          },
          status: "pending",
          cancelable: true,
          priority: "low",
        };
        trades.push(trade);
        accountExternal.matchmakingData.matched = true;
        accountInternal.matchmakingData.matched = true;
      });
    });
    // Βρίσκει τα ζευγάρια που είναι σε όλα συνεπή πλην ώρας και έχουν 10 μονάδες πάνω κάτω στο progress
    updatedAccounts.forEach((accountExternal) => {
      updatedAccounts.forEach((accountInternal) => {
        if (accountExternal._id.toString() === accountInternal._id.toString()) return; // Να μην είναι ίδιο account
        if (accountExternal.matchmakingData.matched) return; // Να μην είναι matched το externalAccount
        if (accountInternal.matchmakingData.matched) return; // Να μην είναι matched το internalAccount
        if (accountExternal.matchmakingData.phase !== accountInternal.matchmakingData.phase) return; // Να είναι ίδιο phase
        if (accountExternal.matchmakingData.company === accountInternal.matchmakingData.company) return; // Να είναι διαφορετικό company
        if (accountExternal.matchmakingData.progress < accountInternal.matchmakingData.progress - 10 || accountExternal.matchmakingData.progress > accountInternal.matchmakingData.progress + 10) return; // Το progress να έχει διαφορά 5 μονάδες πάνω κάτω

        // Έλεγχος αν υπάρχει ήδη trade μεταξύ των δύο accounts
        const tradeExists = trades.some((trade) => (trade.firstParticipant.account === accountExternal._id.toString() && trade.secondParticipant.account === accountInternal._id.toString()) || (trade.firstParticipant.account === accountInternal._id.toString() && trade.secondParticipant.account === accountExternal._id.toString()));
        // Αν υπάρχει ήδη, δεν το προσθέτουμε ξανά
        if (tradeExists) return;

        const trade = {
          firstParticipant: {
            user: accountExternal.user._id.toString(),
            account: accountExternal._id.toString(),
            trade: {},
            priority: "low",
            status: "pending",
          },
          secondParticipant: {
            user: accountInternal.user._id.toString(),
            account: accountInternal._id.toString(),
            trade: {},
            priority: "low",
            status: "pending",
          },
          status: "pending",
          cancelable: true,
          priority: "low",
        };
        trades.push(trade);
        accountExternal.matchmakingData.matched = true;
        accountInternal.matchmakingData.matched = true;
      });
    });
    */
