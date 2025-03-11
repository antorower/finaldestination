import mongoose from "mongoose";
import Account from "./Account";

const PayoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    payoutAmount: Number,
    userShare: Number,
    leaderDept: Number,
    teamDept: Number,
    report: String,

    note: String,

    status: {
      type: String,
      enum: ["Open", "Close"],
      default: "Open",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Payout || mongoose.model("Payout", PayoutSchema);
