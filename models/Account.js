import mongoose from "mongoose";
import User from "./User";
import Company from "./Company";

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
    activities: {
      type: [
        {
          title: String,
          description: String,
          dateTime: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
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

    // 🟢 Notes
    notesVisibility: {
      type: Boolean,
      default: true,
    },
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
