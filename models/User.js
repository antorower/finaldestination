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
  note: {
    type: String,
    trim: true,
  },
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
      },
    ],
  },
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

UserSchema.methods.addBeneficiary = async function (beneficiaryId, percentage) {
  const existingBeneficiary = this.beneficiaries.find((beneficiary) => beneficiary.user.equals(beneficiaryId));
  if (existingBeneficiary) {
    existingBeneficiary.percentage = percentage;
  } else {
    this.beneficiaries.push({ user: beneficiaryId, percentage });
  }
  await this.save();
  return;
};
UserSchema.methods.removeBeneficiary = async function (beneficiaryId) {
  this.beneficiaries.pull({ user: beneficiaryId });
  await this.save();
  return;
};

UserSchema.methods.addAccount = async function (accountId) {
  if (this.accounts.includes(accountId)) return;
  this.accounts.push(accountId);
  await this.save();
  return;
};
UserSchema.methods.removeAccount = async function (accountId) {
  if (!this.accounts.includes(accountId)) return;
  this.accounts.pull(accountId);
  await this.save();
  return;
};

UserSchema.methods.addLeader = async function (userId) {
  if (this.leaders.includes(userId)) return;
  this.leaders.push(userId);
  await this.save();
  return;
};
UserSchema.methods.removeLeader = async function (userId) {
  if (!this.leaders.includes(userId)) return;
  this.leaders.pull(userId);
  await this.save();
  return;
};

UserSchema.methods.addRelatedUser = async function (userId) {
  this.relatedUser = userId;
  await this.save();
  return;
};
UserSchema.methods.removeRelatedUser = async function () {
  this.relatedUser = null;
  await this.save();
  return;
};

UserSchema.methods.addProfits = async function (profit, userId, accountId, description) {
  this.profits = this.profits + profit;
  this.profitsProgress.push({ amount: profit, user: userId, account: accountId, description: description });
  await this.save();
  return;
};

UserSchema.methods.updateNote = async function (note) {
  this.note = note;
  await this.save();
  return;
};

UserSchema.methods.isLeader = function (leaderId) {
  return this.leaders.includes(leaderId);
};
UserSchema.methods.isBeneficiary = function (leaderId) {
  return this.beneficiaries.some((beneficiary) => beneficiary.user.equals(leaderId));
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
