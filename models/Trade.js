import mongoose from "mongoose";
import User from "./User";
import Account from "./Account";

const TradeSchema = new mongoose.Schema(
  {
    firstParticipant: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
      trade: {
        pair: String,
        lots: Number,
        position: String,
        takeProfit: Number,
        stopLoss: Number,
      },
      status: {
        type: String,
        enum: ["pending", "canceled", "accepted", "shown", "completed"],
        default: "pending",
      },
      checking: {
        correctAccount: Boolean,
        correctPair: Boolean,
        correctPosition: Boolean,
        correctLots: Boolean,
        correctStoploss: Boolean,
        correctTakeProfit: Boolean,
        progress: [
          {
            title: String,
            createdAt: {
              type: Number,
              default: () => Date.now(),
            },
          },
        ],
        rush: {
          type: Boolean,
          default: false,
        },
      },
      priority: {
        type: String,
        enum: ["high", "low"],
      },
      profit: Number,
      loss: Number,
    },
    secondParticipant: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
      trade: {
        pair: String,
        lots: Number,
        position: String,
        takeProfit: Number,
        stopLoss: Number,
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "canceled", "shown", "completed"],
        default: "pending",
      },
      checking: {
        correctAccount: Boolean,
        correctPair: Boolean,
        correctPosition: Boolean,
        correctLots: Boolean,
        correctStoploss: Boolean,
        correctTakeProfit: Boolean,
        progress: [
          {
            title: String,
            createdAt: {
              type: Number,
              default: () => Date.now(),
            },
          },
        ],
        rush: {
          type: Boolean,
          default: false,
        },
        time: Number,
      },
      priority: {
        type: String,
        enum: ["high", "low"],
      },
      profit: Number,
      loss: Number,
    },
    openTime: {
      year: Number,
      month: Number,
      day: Number,
      dayString: String,
      hour: Number,
      minutes: Number,
    },
    cancelable: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["pending", "canceled", "accepted", "open", "openPending", "close", "closePending", "review"],
      default: "pending",
    },
    progress: [
      {
        title: String,
        description: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
    },
  },
  { timestamps: true }
);

TradeSchema.pre("save", async function (next) {
  // ----> Ελέγω το status του κάθε user και ορίζω το status του trade
  const firstStatus = this.firstParticipant.status;
  const secondStatus = this.secondParticipant.status;

  if (firstStatus === "pending" || secondStatus === "pending") {
    this.status = "pending";
  } else if (firstStatus === "accepted" && secondStatus === "accepted") {
    this.status = "accepted";
  } else if (firstStatus === "canceled" || secondStatus === "canceled") {
    this.status = "canceled";
  } else if (firstStatus === "shown" || secondStatus === "shown") {
    this.status = firstStatus === "shown" && secondStatus === "shown" ? "open" : "openPending";
  } else if (firstStatus === "completed" || secondStatus === "completed") {
    this.status = firstStatus === "completed" && secondStatus === "completed" ? "close" : "closePending";
  }

  // ----> Ενημέρωση progress για τον πρώτο συμμετέχοντα
  if (this.isModified("firstParticipant.checking.correctAccount")) {
    this.firstParticipant.checking.progress.push({
      title: `Updated correctAccount to ${this.firstParticipant.checking.correctAccount}`,
      createdAt: Date.now(),
    });
  }
  if (this.isModified("firstParticipant.checking.correctPair")) {
    this.firstParticipant.checking.progress.push({
      title: `Updated correctPair to ${this.firstParticipant.checking.correctPair}`,
      createdAt: Date.now(),
    });
  }
  if (this.isModified("firstParticipant.checking.correctPosition")) {
    this.firstParticipant.checking.progress.push({
      title: `Updated correctPosition to ${this.firstParticipant.checking.correctPosition}`,
      createdAt: Date.now(),
    });
  }
  if (this.isModified("firstParticipant.checking.correctLots")) {
    this.firstParticipant.checking.progress.push({
      title: `Updated correctLots to ${this.firstParticipant.checking.correctLots}`,
      createdAt: Date.now(),
    });
  }
  if (this.isModified("firstParticipant.checking.correctStoploss")) {
    this.firstParticipant.checking.progress.push({
      title: `Updated correctStoploss to ${this.firstParticipant.checking.correctStoploss}`,
      createdAt: Date.now(),
    });
  }
  if (this.isModified("firstParticipant.checking.correctTakeProfit")) {
    this.firstParticipant.checking.progress.push({
      title: `Updated correctTakeProfit to ${this.firstParticipant.checking.correctTakeProfit}`,
      createdAt: Date.now(),
    });
  }
  // ----> Ενημέρωση progress για τον δεύτερο συμμετέχοντα
  if (this.isModified("secondParticipant.checking.correctAccount")) {
    this.secondParticipant.checking.progress.push({
      title: `Updated correctAccount to ${this.secondParticipant.checking.correctAccount}`,
      createdAt: Date.now(),
    });
  }
  if (this.isModified("secondParticipant.checking.correctPair")) {
    this.secondParticipant.checking.progress.push({
      title: `Updated correctPair to ${this.secondParticipant.checking.correctPair}`,
      createdAt: Date.now(),
    });
  }
  if (this.isModified("secondParticipant.checking.correctPosition")) {
    this.secondParticipant.checking.progress.push({
      title: `Updated correctPosition to ${this.secondParticipant.checking.correctPosition}`,
      createdAt: Date.now(),
    });
  }
  if (this.isModified("secondParticipant.checking.correctLots")) {
    this.secondParticipant.checking.progress.push({
      title: `Updated correctLots to ${this.secondParticipant.checking.correctLots}`,
      createdAt: Date.now(),
    });
  }
  if (this.isModified("secondParticipant.checking.correctStoploss")) {
    this.secondParticipant.checking.progress.push({
      title: `Updated correctStoploss to ${this.secondParticipant.checking.correctStoploss}`,
      createdAt: Date.now(),
    });
  }
  if (this.isModified("secondParticipant.checking.correctTakeProfit")) {
    this.secondParticipant.checking.progress.push({
      title: `Updated correctTakeProfit to ${this.secondParticipant.checking.correctTakeProfit}`,
      createdAt: Date.now(),
    });
  }

  // Έλεγχος για τον πρώτο συμμετέχοντα αν τον έλεγχο τον έκανε σε λιγότερο από 10 δευτερόλεπτα τρώει penalty
  if (this.firstParticipant.checking.correctAccount && this.firstParticipant.checking.correctPair && this.firstParticipant.checking.correctPosition && this.firstParticipant.checking.correctLots && this.firstParticipant.checking.correctStoploss && this.firstParticipant.checking.correctTakeProfit) {
    if (this.firstParticipant.checking.progress.length >= 2) {
      const firstTimestamp = this.firstParticipant.checking.progress[0].createdAt;
      const lastTimestamp = this.firstParticipant.checking.progress[this.firstParticipant.checking.progress.length - 1].createdAt;

      if (lastTimestamp - firstTimestamp < 10 * 1000) {
        // 10 δευτερόλεπτα σε milliseconds
        this.firstParticipant.checking.rush = true;

        const user = await User.findById(this.firstParticipant.user);
        if (user) {
          await user.addPoints({
            title: "Rushing Penalty",
            description: `Ο/Η ${user.firstName} ${user.lastName} έχασε 3 points επειδή ξεπέταξε τον έλεγχο σε ${((lastTimestamp - firstTimestamp) * 1000).toFixed(0)} δευτερόλεπτα.`,
            points: -3,
          });
        }
      }
    }
  }
  // Έλεγχος για τον δεύτερο συμμετέχοντα αν τον έλεγχο τον έκανε σε λιγότερο από 10 δευτερόλεπτα τρώει penalty
  if (this.secondParticipant.checking.correctAccount && this.secondParticipant.checking.correctPair && this.secondParticipant.checking.correctPosition && this.secondParticipant.checking.correctLots && this.secondParticipant.checking.correctStoploss && this.secondParticipant.checking.correctTakeProfit) {
    if (this.secondParticipant.checking.progress.length >= 2) {
      const firstTimestamp = this.secondParticipant.checking.progress[0].createdAt;
      const lastTimestamp = this.secondParticipant.checking.progress[this.secondParticipant.checking.progress.length - 1].createdAt;

      if (lastTimestamp - firstTimestamp < 10 * 1000) {
        // 10 δευτερόλεπτα σε milliseconds
        this.secondParticipant.checking.rush = true;

        const user = await User.findById(this.secondParticipant.user);
        if (user) {
          await user.addPoints({
            title: "Rushing Penalty",
            description: `Ο/Η ${user.firstName} ${user.lastName} έχασε 3 points επειδή ξεπέταξε τον έλεγχο σε ${((lastTimestamp - firstTimestamp) * 1000).toFixed(0)} δευτερόλεπτα.`,
            points: -3,
          });
        }
      }
    }
  }

  next();
});

export default mongoose.models.Trade || mongoose.model("Trade", TradeSchema);
