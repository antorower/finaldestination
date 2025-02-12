import mongoose from "mongoose";
import User from "./User";
import Company from "./Company";

const PairSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
    },
    lots: {
      fast: Number,
      slow: Number,
    },
    priority: Number,
  },
  { timestamps: true }
);

export default mongoose.models.Pair || mongoose.model("Pair", PairSchema);
