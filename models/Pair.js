import mongoose from "mongoose";
import User from "./User";
import Company from "./Company";

const PairSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
    },
    lots: Number,
    priority: Number,
    expensesFactor: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Pair || mongoose.model("Pair", PairSchema);
// Τα lots είναι ανά 1000$ στο stoploss/takeprofit
