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
        enum: ["pending", "canceled", "accepted", "shown", "completed"],
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
        enum: ["pending", "accepted", "canceled", "shown", "completed"],
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
      year: Number,
      month: Number,
      day: Number,
      dayString: String,
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

TradeSchema.pre("save", function (next) {
  const firstStatus = this.firstParticipant.status;
  const secondStatus = this.secondParticipant.status;

  if (firstStatus === "pending" || secondStatus === "pending") {
    this.status = "pending";
  } else if (firstStatus === "accepted" && secondStatus === "accepted") {
    this.status = "accepted";
  } else if (firstStatus === "canceled" || secondStatus === "canceled") {
    this.status = "canceled";
  } else if (firstStatus === "shown" || secondStatus === "shown") {
    this.status = firstStatus === "shown" && secondStatus === "shown" ? "open" : "openPending";
  } else if (firstStatus === "completed" || secondStatus === "completed") {
    this.status = firstStatus === "completed" && secondStatus === "completed" ? "close" : "closePending";
  }

  next();
});

export default mongoose.models.Trade || mongoose.model("Trade", TradeSchema);
