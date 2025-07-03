import mongoose from "mongoose";
import User from "./User";
import Company from "./Company";
import Trade from "./Trade";

const AccountSchema = new mongoose.Schema(
  {
    // 🟢 Identity
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    number: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    // 🟢 Λεπτομέριες
    capital: {
      type: Number,
      required: true,
      min: 0,
    },
    phase: {
      type: Number,
      required: true,
      min: 1,
    },
    balance: {
      type: Number,
      required: true,
      min: 0,
    },

    // 🟢 Status
    status: {
      type: String,
      enum: ["Pending Purchase", "Live", "Pending Upgrade", "Upgrade Done", "Pending Payout", "Payout Request Done", "Money Sended", "Lost", "Review"],
      default: "Pending Purchase",
    },
    isOnBoarding: {
      type: Boolean,
      default: true,
    },
    needBalanceUpdate: {
      type: Boolean,
      default: false,
    },
    adminCaseOn: {
      type: Boolean,
      default: false,
    },
    adminNote: String,

    // 🟢 Progress
    progress: Number,
    lastTrade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trade",
      default: null,
    },

    // 🟢 Dates
    targetReachedDate: Date,
    lostDate: Date,
    purchaseDate: Date,
    firstTradeDate: Date,
    upgradedDate: Date,
    payoutRequestDoneDate: Date,
    profitsSendedDate: Date,
    payoutRequestDate: Date,

    // 🟢 Metadata
    timesPaid: {
      type: Number,
      default: 0,
    },
    grossProfit: {
      type: Number,
      default: 0,
      min: 0,
    },
    netProfit: {
      type: Number,
      default: 0,
      min: 0,
    },

    // 🟢 Credentials
    login: String,
    password: String,
    server: String,

    note: String,

    offer: String,

    shadowban: Boolean,
  },
  { timestamps: true }
);

AccountSchema.pre("save", async function (next) {
  try {
    // ✅ Αν δεν έχει αλλάξει κάτι σχετικό, δεν τρέχουμε τον υπολογισμό
    if (!this.isModified("balance") && !this.isModified("capital") && !this.isModified("phase")) {
      return next();
    }

    if (!this.company) {
      return next(new Error("Company is required to calculate progress"));
    }

    // 🟢 Φόρτωσε τα δεδομένα της εταιρείας
    const company = await mongoose.model("Company").findById(this.company).lean();

    if (!company) {
      return next(new Error("Company data not found"));
    }

    // 🟢 Εξασφαλίζουμε ότι η phase είναι μεταξύ 1-3
    const phases = ["phase1", "phase2", "phase3"];
    const companyPhase = phases[this.phase - 1];

    if (!company[companyPhase]) {
      return next(new Error(`Phase data missing for ${companyPhase}`));
    }

    // ✅ Έλεγχος αν τα απαραίτητα δεδομένα είναι αριθμοί
    const targetPercentage = company[companyPhase].target;
    const drawdownPercentage = company[companyPhase].totalDrawdown;

    if (typeof targetPercentage !== "number" || typeof drawdownPercentage !== "number") {
      return next(new Error(`Invalid data for ${companyPhase}: target or totalDrawdown is missing or incorrect`));
    }

    // 🟢 Υπολογισμός στόχου και drawdown
    const target = this.capital + (this.capital * targetPercentage) / 100;
    const finalDrawdownBalance = this.capital - (this.capital * drawdownPercentage) / 100;
    const totalAmount = target - finalDrawdownBalance;

    // 🟢 Υπολογισμός progress
    if (totalAmount > 0) {
      this.progress = Math.floor(((this.balance - finalDrawdownBalance) / totalAmount) * 100);
    } else {
      this.progress = 0;
    }

    next();
  } catch (error) {
    next(error);
  }
});

AccountSchema.methods.updateBalance = async function (newBalance, tp, sl) {
  try {
    // 🟢 Έλεγχος Κλεισίματος
    if (tp && sl) {
      const tpMin = this.balance + tp * 0.8;
      const tpMax = this.balance + tp * 1.2;
      const slMin = this.balance - sl * 1.2;
      const slMax = this.balance - sl * 0.8;

      if (!(newBalance >= tpMin && newBalance <= tpMax) && !(newBalance >= slMin && newBalance <= slMax)) {
        this.adminCaseOn = true;
        this.adminNote = `Το παλιό balance ήταν ${this.balance} και το νέο ${newBalance} με take profit ${tp} και stoploss ${sl}`;
      }
    }

    // 🟢 Ενημέρωση του balance
    this.balance = newBalance;
    this.needBalanceUpdate = false;
    //this.note = null;

    // 🟢 Φόρτωσε τα δεδομένα της εταιρείας
    const company = await mongoose.model("Company").findById(this.company).lean();
    if (!company) {
      throw new Error("Company data not found");
    }

    // 🟢 Επιλογή της σωστής φάσης
    const phases = ["phase1", "phase2", "phase3"];
    const companyPhase = phases[this.phase - 1];

    if (!company[companyPhase]) {
      throw new Error(`Phase data missing for ${companyPhase}`);
    }

    // ✅ Υπολογισμός στόχου και drawdown
    const targetPercentage = company[companyPhase].target;
    const drawdownPercentage = company[companyPhase].totalDrawdown;

    const target = this.capital + (this.capital * targetPercentage) / 100;
    const finalDrawdownBalance = this.capital - (this.capital * drawdownPercentage) / 100;

    const now = new Date();

    // 🟢 Έλεγχος αν έπιασε τον στόχο
    if (this.balance >= target) {
      if (this.phase === 3) {
        this.status = "Pending Payout";
        this.targetReachedDate = now;
        //this.note = "Ημερομηνία Payout";
      } else {
        this.status = "Pending Upgrade";
        this.targetReachedDate = now;
        this.note = "Κάνε Upgrade";
      }
    } else if (this.balance <= finalDrawdownBalance * 1.003) {
      this.status = "Review";
      this.lostDate = now;

      const user = await mongoose.model("User").findById(this.user);
      user.accounts = user.accounts.filter((accId) => accId.toString() !== this._id.toString());
      await user.save();
    }

    // ✅ Αποθήκευση των αλλαγών
    await this.save();
  } catch (error) {
    throw new Error(`Error updating balance: ${error.message}`);
  }
};

export default mongoose.models.Account || mongoose.model("Account", AccountSchema);
