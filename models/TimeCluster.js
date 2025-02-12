import mongoose from "mongoose";
import User from "./User";

const TimeClusterSchema = new mongoose.Schema(
  {
    startingHour: {
      hour: Number,
      minutes: Number,
    },
    endingHour: {
      hour: Number,
      minutes: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.models.TimeCluster || mongoose.model("TimeCluster", TimeClusterSchema);
