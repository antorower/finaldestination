import mongoose from "mongoose";
import User from "./User";
import Company from "./Company";

const AccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    number: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    capital: Number,
    phase: Number,
    balance: Number,
    activities: [
      {
        title: String,
        description: String,
        dateTime: { type: Date, default: () => new Date() },
      },
    ],
    status: {
      type: String,
      enum: ["WaitingPurchase", "Live", "NeedUpgrade", "UpgradeDone", "WaitingPayout", "PayoutRequestDone", "MoneySended", "Lost", "Review"],
    },
    isOnBoarding: {
      type: Boolean,
      default: true,
    },
    note: {
      type: String,
      trim: true,
    },
    lastTrade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trade",
    },
    payoutRequestDate: {
      day: Number,
      month: Number,
      year: Number,
    },
    targetReachedDate: Date,
    lostDate: Date,
    purchaseDate: Date,
    firstTradeDate: Date,
    upgradedDate: Date,
    payoutRequestDoneDate: Date,
    profitsSendedDate: Date,
    timesPaid: {
      type: Number,
      default: 0,
    },
    grossProfit: {
      type: Number,
      default: 0,
    },
    netProfit: {
      type: Number,
      default: 0,
    },
    needBalanceUpdate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

AccountSchema.pre("save", async function (next) {
  if (this.isModified("balance") || this.isNew) {
    const company = await Company.findById(this.company).lean(); // Παίρνει την εταιρεία
    const phase = company.phases[this.phase - 1];

    const targetBalance = (1 + phase.target) * this.capital;
    const drawdownBalance = (1 - phase.totalDrawdown) * this.capital;

    // Κάθε φορά που αλλάζει το balance ελέγχεται αν το account πρέπει να αλλάξει status
    if (this.phase + 1 < company.phases.length) {
      if (this.balance >= targetBalance) {
        this.targetReached();
      }
    } else {
      if (this.balance >= targetBalance - targetBalance * 0.005) {
        this.targetReached();
      }
    }

    if (this.balance <= drawdownBalance) {
      this.accountLost();
    }
  }
  next();
});

export default mongoose.models.Account || mongoose.model("Account", AccountSchema);
