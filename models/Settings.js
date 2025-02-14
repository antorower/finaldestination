import mongoose from "mongoose";
import Pair from "./Pair";

const SettingsSchema = new mongoose.Schema(
  {
    monday: {
      stringDate: String,
      mode: {
        type: String,
        enum: ["fast", "slow"],
      },
      pairs: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Pair",
        },
      ],
      hours: {
        min: Number,
        max: Number,
      },
      note: String,
    },
    tuesday: {
      stringDate: String,
      mode: {
        type: String,
        enum: ["fast", "slow"],
      },
      pairs: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Pair",
        },
      ],
      hours: {
        min: Number,
        max: Number,
      },
      note: String,
    },
    wednesday: {
      stringDate: String,
      mode: {
        type: String,
        enum: ["fast", "slow"],
      },
      pairs: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Pair",
        },
      ],
      hours: {
        min: Number,
        max: Number,
      },
      note: String,
    },
    thursday: {
      stringDate: String,
      mode: {
        type: String,
        enum: ["fast", "slow"],
      },
      pairs: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Pair",
        },
      ],
      hours: {
        min: Number,
        max: Number,
      },
      note: String,
    },
    friday: {
      stringDate: String,
      mode: {
        type: String,
        enum: ["fast", "slow"],
      },
      pairs: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Pair",
        },
      ],
      hours: {
        min: Number,
        max: Number,
      },
      note: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
