import mongoose from "mongoose";
import Pair from "./Pair";

const SettingsSchema = new mongoose.Schema(
  {
    monday: {
      stringDate: String,
      mode: String,
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
    },
    tuesday: {
      stringDate: String,
      mode: String,
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
    },
    wednesday: {
      stringDate: String,
      mode: String,
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
    },
    thursday: {
      stringDate: String,
      mode: String,
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
    },
    friday: {
      stringDate: String,
      mode: String,
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
    },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
