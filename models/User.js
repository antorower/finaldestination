import mongoose from "mongoose";
import Account from "./Account";
import Evaluation from "./Evaluation";

const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  telephone: {
    type: String,
    trim: true,
  },
  bybitEmail: {
    type: String,
    trim: true,
    unique: true,
  },
  bybitUid: {
    type: String,
    trim: true,
    unique: true,
  },
  accepted: {
    type: Boolean,
    default: false,
  },
  team: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  beneficiaries: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      percentage: {
        type: Number,
        default: 0,
      },
    },
  ],
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  accounts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
  ],
  profits: {
    type: Number,
    default: 0,
  },
  profitsProgress: [
    {
      amount: Number,
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
      description: String,
    },
  ],
  tradingHours: {
    startingTradingHour: Number,
    endingTradingHour: Number,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },
  evaluation: {
    points: {
      type: Number,
      default: 100,
    },
    progress: [
      {
        title: String,
        description: String,
        points: Number,
        time: {
          type: Date,
          default: () => new Date(),
        },
      },
    ],
  },
  questions: [
    {
      question: String,
      answer: String,
    },
  ],
  lastTradeOpened: Date,
});

UserSchema.methods.addPoints = async function ({ title, description, points }) {
  if (!this.evaluation) {
    this.evaluation = { points: 100, progress: [] };
  }
  if (!this.evaluation.progress) {
    this.evaluation.progress = [];
  }

  this.evaluation.points = this.evaluation.points + points;
  this.evaluation.progress.push({ title, description, points });
  await this.save();

  const newEvaluation = new Evaluation({ user: this._id, title, description, points });
  await newEvaluation.save();
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
