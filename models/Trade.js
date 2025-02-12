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
        enum: ["pending", "canceled", "accepted", "shown"],
        default: "pending",
      },
      priority: {
        type: String,
        enum: ["high", "low"],
      },
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
        enum: ["pending", "accepted", "canceled", "shown"],
        default: "pending",
      },
      priority: {
        type: String,
        enum: ["high", "low"],
      },
      profit: Number,
      loss: Number,
    },
    openTime: {
      hour: Number,
      minutes: Number,
    },
    cancelable: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["pending", "canceled", "accepted", "open", "openPending", "close", "closePending", "review"],
      default: "pending",
    },
    progress: [
      {
        title: String,
        description: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Trade || mongoose.model("Trade", TradeSchema);
