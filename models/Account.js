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
  },
  { timestamps: true }
);

AccountSchema.pre("save", async function (next) {
  next();
});

export default mongoose.models.Account || mongoose.model("Account", AccountSchema);
