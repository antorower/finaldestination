import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  // 🟢 Προσωπικές Πληροφορίες
  clerkId: {
    type: String,
    required: true,
    unique: true,
    maxlength: 50,
    minlength: 5,
    trim: true,
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: 25,
    minlength: 2,
    required: true,
    set: (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 30,
    minlength: 2,
    required: true,
    set: (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
  },
  telephone: {
    type: String,
    trim: true,
    maxlength: 30,
    minlength: 5,
    required: true,
    match: [/^\+?[0-9\- ]+$/, "Invalid telephone format"],
  },
  bybitEmail: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    maxlength: 80,
    minlength: 5,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    lowercase: true,
  },
  bybitUid: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    maxlength: 30,
    minlength: 5,
  },

  // 🟢 Roles
  isOwner: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isLeader: {
    type: Boolean,
    default: false,
  },

  // 🟢 Status
  accepted: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },

  // 🟢 Ομάδα
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  family: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  team: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  beneficiaries: {
    type: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        percentage: {
          type: Number,
          default: 0,
        },
      },
    ],
    default: [],
  },

  // 🟢 Accounts
  accounts: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
    default: [],
  },

  // 🟢 Finance
  profits: {
    type: Number,
    default: 0,
  },
  dept: {
    type: Number,
    default: 0,
  },
  salary: {
    type: Number,
    default: 0,
  },
  share: {
    type: Number,
    default: 0,
  },

  // 🟢 Schedule
  tradingHours: {
    startingTradingHour: {
      type: Number,
      min: 4,
      max: 16,
    },
    endingTradingHour: {
      type: Number,
      min: 5,
      max: 16,
      validate: {
        validator: function (value) {
          return value > this.startingTradingHour;
        },
        message: "Η ώρα λήξης πρέπει να είναι μεγαλύτερη από την ώρα έναρξης.",
      },
    },
  },

  // 🟢 Stats
  mistakes: {
    count: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      default: 0,
    },
  },
  payouts: {
    count: {
      type: Number,
      default: 0,
    },
    teamProfits: {
      type: Number,
      default: 0,
    },
    personalProfits: {
      type: Number,
      default: 0,
    },
  },
  trades: {
    accepted: {
      highPriority: {
        type: Number,
        default: 0,
      },
      lowPriority: {
        type: Number,
        default: 0,
      },
    },
    rejected: {
      highPriority: {
        type: Number,
        default: 0,
      },
      lowPriority: {
        type: Number,
        default: 0,
      },
    },
    win: {
      type: Number,
      default: 0,
    },
    lose: {
      type: Number,
      default: 0,
    },
  },
  allAccounts: {
    bought: {
      type: Number,
      default: 0,
    },
    passedPhase1: {
      type: Number,
      default: 0,
    },
    passedPhase2: {
      type: Number,
      default: 0,
    },
  },

  // 🟢 Settings
  flexibleTradesSuggestions: {
    type: Boolean,
    default: true,
  },
  showGuidesOnWebsite: {
    type: Boolean,
    default: true,
  },
  hourOffsetFromGreece: {
    type: Number,
    default: 0,
  },
  openingReminder: {
    type: Boolean,
    default: false,
  },
  closingReminder: {
    type: Boolean,
    default: false,
  },

  // 🟢 Metadata
  adminNote: {
    type: String,
    default: "",
    trim: true,
  },
  userNote: {
    type: String,
    trim: true,
    maxlength: 500,
    default: "",
  },

  // 🟢 Companies Data
  kycCompanies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  ],
  interviewCompanies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  ],
  inactiveCompanies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  ],
});

UserSchema.methods.updateSalary = async function (amount) {
  if (isNaN(amount) || amount < 0) throw new Error("Ο μισθός πρέπει να είναι θετικός αριθμός");
  await this.updateOne({ salary: amount });
};

UserSchema.methods.updateShare = async function (percentage) {
  if (isNaN(percentage) || percentage < 0 || percentage > 1) throw new Error("Το ποσοστό θα πρέπει να είναι ένας αριθμός μεταξύ του 0 και του 1");
  await this.updateOne({ share: percentage });
};

UserSchema.methods.addAccount = async function (accountId) {
  if (!mongoose.Types.ObjectId.isValid(accountId)) throw new Error("Μη έγκυρο ID account");
  await this.updateOne({ $addToSet: { accounts: accountId } });
};

UserSchema.methods.removeAccount = async function (accountId) {
  if (!mongoose.Types.ObjectId.isValid(accountId)) throw new Error("Μη έγκυρο ID account");
  await this.updateOne({ $pull: { accounts: accountId } });
};

UserSchema.methods.setLeader = async function (leaderId) {
  if (!mongoose.Types.ObjectId.isValid(leaderId)) throw new Error("Μη έγκυρο ID leader");
  await this.updateOne({ leader: leaderId });
};

UserSchema.methods.setFamily = async function (familyId) {
  if (!mongoose.Types.ObjectId.isValid(familyId)) throw new Error("Μη έγκυρο ID family");
  await this.updateOne({ family: familyId });
};

UserSchema.methods.addToTeam = async function (userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Μη έγκυρο ID χρήστη");
  await this.updateOne({ $addToSet: { team: userId } });
};

UserSchema.methods.removeFromTeam = async function (userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Μη έγκυρο ID χρήστη");
  await this.updateOne({ $pull: { team: userId } });
};

UserSchema.methods.addBeneficiary = async function (userId, percentage) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Μη έγκυρο ID χρήστη");
  if (isNaN(percentage) || percentage < 0) throw new Error("Το ποσοστό πρέπει να είναι θετικός αριθμός");
  await this.updateOne({
    $push: { beneficiaries: { user: userId, percentage } },
  });
};

UserSchema.methods.removeBeneficiary = async function (userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Μη έγκυρο ID χρήστη");
  await this.updateOne({ $pull: { beneficiaries: { user: userId } } });
};

UserSchema.methods.addMistakeStats = async function (amount) {
  if (isNaN(amount)) throw new Error("Υπάρχει πρόβλημα με το ποσό που θα προστεθεί στα στατιστικά των λαθών του user");
  await this.updateOne({
    $inc: {
      "mistakes.count": 1,
      "mistakes.amount": amount,
    },
  });
};

UserSchema.methods.addPayoutStats = async function (teamProfits, personalProfits) {
  if (isNaN(teamProfits) || isNaN(personalProfits)) throw new Error("Υπάρχει πρόβλημα με τα ποσά που θα προστεθούν στα στατιστικά των payouts του user");
  await this.updateOne({
    $inc: {
      "payouts.count": 1,
      "payouts.teamProfits": teamProfits,
      "payouts.personalProfits": personalProfits,
    },
  });
};

UserSchema.methods.addTradesAcceptanceStats = async function (status, priority) {
  if (!["accepted", "rejected"].includes(status)) throw new Error("Μη έγκυρη κατάσταση trade. Επιτρεπτές τιμές: accepted, rejected");
  if (!["highPriority", "lowPriority"].includes(priority)) throw new Error("Μη έγκυρη προτεραιότητα trade. Επιτρεπτές τιμές: highPriority, lowPriority");
  await this.updateOne({
    $inc: {
      [`trades.${status}.${priority}`]: 1,
    },
  });
};

UserSchema.methods.addTradesWinLoseStats = async function (result) {
  if (!["win", "lose"].includes(result)) throw new Error("Μη έγκυρο αποτέλεσμα trade. Επιτρεπτές τιμές: win, lose");
  await this.updateOne({
    $inc: {
      [`trades.${result}`]: 1,
    },
  });
};

UserSchema.methods.addProfits = async function (amount) {
  if (isNaN(amount)) throw new Error("Υπάρχει πρόβλημα με το ποσό που θα προστεθεί στα profits του user");
  await this.updateOne({ $inc: { profits: amount } });
};

UserSchema.methods.addDept = async function (amount) {
  if (isNaN(amount)) throw new Error("Υπάρχει πρόβλημα με το ποσό που θα προστεθεί στο χρέος του user");
  await this.updateOne({ $inc: { dept: amount } });
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
