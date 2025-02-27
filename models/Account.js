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

    note: String,
  },
  { timestamps: true }
);

AccountSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("balance") && !this.isModified("capital") && !this.isModified("phase")) {
      return next(); // Αν δεν άλλαξε κάτι σχετικό, προχωράμε χωρίς υπολογισμό
    }
    if (!this.company) {
      return next(new Error("Company is required to calculate progress"));
    }

    // 🟢 Φόρτωσε τα δεδομένα της εταιρείας
    const company = await mongoose.model("Company").findById(this.company);

    if (!company) {
      return next(new Error("Company data not found"));
    }

    const phases = ["phase1", "phase2", "phase3"];
    const companyPhase = phases[this.phase - 1];

    if (!company[companyPhase]) {
      return next(new Error(`Phase data missing for ${companyPhase}`));
    }

    // Υπολογισμός στόχου και drawdown
    const target = this.capital + (this.capital * company[companyPhase].target) / 100;
    const finalDrawdownBalance = this.capital - (this.capital * company[companyPhase].totalDrawdown) / 100;
    const totalAmount = target - finalDrawdownBalance;

    // Υπολογισμός progress
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

export default mongoose.models.Account || mongoose.model("Account", AccountSchema);
