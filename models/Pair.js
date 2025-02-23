import mongoose from "mongoose";

const PairSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    lots: {
      type: Number,
      required: true,
    },
    priority: {
      type: Number,
      required: true,
    },
    costFactor: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Pair || mongoose.model("Pair", PairSchema);
