import mongoose from "mongoose";
import User from "./User";

const EvaluationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: String,
    description: String,
    points: Number,
  },
  { timestamps: true }
);

export default mongoose.models.Evaluation || mongoose.model("Evaluation", EvaluationSchema);
