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
        enum: ["pending", "canceled", "accepted", "aware", "try", "open", "closed"],
        default: "pending",
      },
      checked: {
        type: Boolean,
        default: false,
      },
      priority: {
        type: String,
        enum: ["high", "low"],
      },
      progress: Number,
      profit: Number,
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
        enum: ["pending", "canceled", "accepted", "aware", "try", "open", "closed"],
        default: "pending",
      },
      checked: {
        type: Boolean,
        default: false,
      },
      priority: {
        type: String,
        enum: ["high", "low"],
      },
      progress: Number,
      profit: Number,
    },
    openTime: Date,
    status: {
      type: String,
      enum: ["pending", "accepted", "open", "completed", "review"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
    },
    profit: Number,
    note: String,
  },
  { timestamps: true }
);

export default mongoose.models.Trade || mongoose.model("Trade", TradeSchema);
