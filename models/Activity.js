import mongoose from "mongoose";
import User from "./User";
import Company from "./Company";
import Trade from "./Trade";
import Account from "./Account";

const ActivitySchema = new mongoose.Schema(
  {
    // 🟢 Identity
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    trade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trade",
      index: true,
    },

    sign: {
      type: String,
      emum: ["positive", "neutral", "negative"],
      default: "neutral",
    },

    // 🟢 Info
    title: String,
    description: String,
  },
  { timestamps: true }
);

export default mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);
