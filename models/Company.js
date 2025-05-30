import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
    },
    maxAccounts: {
      type: Number,
      default: 1,
    },
    phase1: {
      dailyDrawdown: Number,
      totalDrawdown: Number,
      target: Number,
      maxRiskPerTrade: Number,
      instructions: {
        type: String,
        default: "",
      },
    },
    phase2: {
      dailyDrawdown: Number,
      totalDrawdown: Number,
      target: Number,
      maxRiskPerTrade: Number,
      instructions: {
        type: String,
        default: "",
      },
    },
    phase3: {
      dailyDrawdown: Number,
      totalDrawdown: Number,
      target: Number,
      maxRiskPerTrade: Number,
      instructions: {
        type: String,
        default: "",
      },
    },
    costFactor: {
      type: Number,
      default: 3,
    },
    maxLots: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Company || mongoose.model("Company", CompanySchema);
