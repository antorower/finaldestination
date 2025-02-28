import mongoose from "mongoose";
import User from "./User";
import Account from "./Account";

const TradeSchema = new mongoose.Schema(
  {
    firstParticipant: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
      trade: {
        pair: String,
        lots: Number,
        position: String,
        takeProfit: Number,
        stopLoss: Number,
      },
      status: {
        type: String,
        enum: ["pending", "canceled", "accepted", "aware", "open", "closed"],
        default: "pending",
      },
      priority: {
        type: String,
        enum: ["high", "low"],
      },
      progress: Number,
      profit: Number,
      loss: Number,
    },
    secondParticipant: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
      trade: {
        pair: String,
        lots: Number,
        position: String,
        takeProfit: Number,
        stopLoss: Number,
      },
      status: {
        type: String,
        enum: ["pending", "canceled", "accepted", "aware", "open", "closed"],
        default: "pending",
      },
      priority: {
        type: String,
        enum: ["high", "low"],
      },
      progress: Number,
      profit: Number,
      loss: Number,
    },
    openTime: Date,
    status: {
      type: String,
      enum: ["pending", "canceled", "accepted", "open", "openPending", "closePending", "aware", "awarePending", "completed", "review"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
    },
  },
  { timestamps: true }
);

TradeSchema.pre("save", async function (next) {
  // ----> Ελέγω το status του κάθε user και ορίζω το status του trade
  const statuses = [this.firstParticipant.status, this.secondParticipant.status];

  if (statuses.includes("canceled")) {
    this.status = "canceled";
  } else if (statuses.includes("pending")) {
    this.status = "pending";
  } else if (statuses.includes("aware") && !statuses.every((s) => s === "aware")) {
    this.status = "awarePending";
  } else if (statuses.every((s) => s === "aware")) {
    this.status = "aware";
  } else if (statuses.every((s) => s === "accepted")) {
    this.status = "accepted";
  } else if (statuses.every((s) => s === "open")) {
    this.status = "open";
  } else if (statuses.includes("open") && !statuses.every((s) => s === "open")) {
    this.status = "openPending";
  } else if (statuses.includes("closed") && !statuses.every((s) => s === "closed")) {
    this.status = "closePending";
  }

  next();
});

export default mongoose.models.Trade || mongoose.model("Trade", TradeSchema);
