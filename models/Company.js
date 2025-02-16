import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
    },
    maxAccounts: Number,
    phases: [
      {
        name: String,
        dailyDrawdown: Number,
        totalDrawdown: Number,
        target: Number,
        maxRiskPerTrade: Number,
        instructions: {
          type: String,
          default: "",
        },
      },
    ],
    commissionFactor: Number,
    link: String,
    maxLots: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Company || mongoose.model("Company", CompanySchema);
