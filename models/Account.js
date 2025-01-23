import mongoose from "mongoose";
import * as Settings from "@/lib/AppData";
import User from "./User";

const AccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    company: String,
    number: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    capital: Number,
    phase: Number,
    balance: {
      type: Number,
      validate: {
        validator: function (value) {
          return Number.isInteger(value) && value >= 80000 && value <= 250000;
        },
        message: "{VALUE} is not a valid integer or not in the range of 80000 to 250000",
      },
    },
    activities: [
      {
        title: String,
        description: String,
        dateTime: { type: Date, default: () => new Date() },
      },
    ],
    status: {
      type: String,
      enum: ["WaitingPurchase", "Live", "NeedUpgrade", "UpgradeDone", "WaitingPayout", "PayoutRequestDone", "MoneySended", "Lost", "Review"],
    },
    note: {
      type: String,
      trim: true,
    },
    lastTrade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trade",
    },
    payoutRequestDate: {
      day: Number,
      month: Number,
    },
    eventsTimestamp: {
      targetReachedDate: Date,
      lostDate: Date,
      purchaseDate: Date,
      firstTradeDate: Date,
      upgradedDate: Date,
      payoutRequestDoneDate: Date,
      profitsSendedDate: Date,
    },
    metadata: {
      timesPaid: {
        type: Number,
        default: 0,
      },
      balanceCategory: Number,
      relatedAccounts: {
        previousAccount: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
        nextAccount: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
      },
    },
    investment: Boolean,
  },
  { timestamps: true }
);

AccountSchema.pre("save", async function (next) {
  if (this.isModified("balance") || this.isNew) {
    const company = Settings.GetCompany(this.company);
    const phase = company.phases[this.phase];

    const targetBalance = (1 + phase.target) * this.capital;
    const drawdownBalance = (1 - phase.maxDrawdown) * this.capital;
    const targetDollars = phase.target * this.capital;
    const drawdownDollars = phase.maxDrawdown * this.capital;

    // Κάθε φορά που αλλάζει το balance ενημερώνεται η κατηγορία του account
    const step = (targetDollars + drawdownDollars) / 10;
    const categories = [];
    for (let i = 1; i <= 10; i++) {
      categories.push(drawdownBalance + i * step);
    }
    for (let i = 0; i < categories.length - 1; i++) {
      if (this.balance > categories[i] && this.balance <= categories[i + 1]) {
        this.metadata.balanceCategory = i + 1;
        break;
      }
    }

    // Κάθε φορά που αλλάζει το balance ελέγχεται αν το account πρέπει να αλλάξει status
    if (this.phaseWeight < 3) {
      if (this.balance >= targetBalance) {
        this.targetReached();
      }
    } else {
      if (this.company !== "The5ers") {
        if (this.balance >= targetBalance - targetBalance * 0.008) {
          this.targetReached();
        }
      } else {
        if (this.balance >= targetBalance) {
          this.targetReached();
        }
      }
    }

    if (this.balance <= drawdownBalance) {
      this.accountLost();
    }
  }

  if (this.isModified("phase") || this.isNew) {
    const company = Settings.GetCompany(this.company);
    this.phaseWeight = company.phases[this.phase].weight;
  }
  next();
});

// PROGRESS METHODS
AccountSchema.methods.accountInitialization = async function (userId, companyName, capital, investment, investor) {
  const company = Settings.GetCompany(companyName);
  this.user = userId;
  this.company = companyName;
  this.capital = capital;
  this.phase = 0;
  this.phaseWeight = company.phases[0].weight;
  this.balance = capital;
  this.status = "WaitingPurchase";
  this.note = `Funds has been sent to your wallet. Purchase your ${companyName} account of $${this.capital.toLocaleString("de-DE")} and save your account number`;
  this.addActivity("Funds sent", "Funds send for buying new account");
  this.investment = investment;
  if (investment) this.investor = investor;
  await this.save();

  await this.populate("user");
  await this.user.addAccount(this._id);
  return;
};

AccountSchema.methods.createUpgradedAccount = async function (oldAccount, newNumber) {
  this.user = oldAccount.user;

  this.company = oldAccount.company;
  this.number = newNumber;
  this.capital = oldAccount.capital;
  this.phase = oldAccount.phase + 1;
  this.balance = oldAccount.capital;
  this.status = "Live";
  this.note = `Your upgraded account ${newNumber} is ready for trading`;
  this.metadata.relatedAccounts.previousAccount = oldAccount._id;
  this.addActivity("Upgraded account created", "Upgraded account created");
  await this.save();

  await this.populate("user");
  await this.user.addAccount(this._id);
  return;
};

AccountSchema.methods.upgradeAccount = async function (nextAccountId) {
  await this.populate("user");
  await this.user.removeAccount(this._id);
  this.eventsTimestamp.upgradedDate = new Date();
  this.status = "UpgradeDone";
  this.note = "Account has been upgraded";
  this.addActivity("Account upgraded", "Account has been upgraded");
  this.metadata.relatedAccounts.nextAccount = nextAccountId;
  await this.save();
  return;
};

AccountSchema.methods.accountPurchased = async function (number) {
  this.number = number;
  this.status = "Live";
  this.eventsTimestamp.purchaseDate = new Date();
  this.note = "Your account is ready for trading";
  this.addActivity("Account purchased", "The user purchase the account and set the account number");
  await this.save();
  return;
};

AccountSchema.methods.targetReached = function () {
  const company = Settings.GetCompany(this.company);
  if (company.phases.length === this.phase + 1) {
    this.status = "WaitingPayout";
    this.addActivity("Profits gained", "A funded account gain profits");
  } else {
    this.status = "NeedUpgrade";
    this.addActivity("Phase passed", "The account reach the target");
  }
  this.eventsTimestamp.targetReachedDate = new Date();
};

AccountSchema.methods.reviewFinished = async function () {
  this.status = "Lost";
  this.addActivity("Review finished", "Review finished");
  await this.save();
  return;
};

AccountSchema.methods.resetAfterPayoutSended = async function () {
  this.balance = this.capital;
  this.status = "Live";
  this.note = "Your account is ready for trading. Happy profits again!";
  this.eventsTimestamp.payoutRequestDate = null;
  this.eventsTimestamp.payoutRequestDoneDate = null;
  this.eventsTimestamp.profitsSendedDate = null;
  this.addActivity("Payout accepted", "Payout accepted and account is reseted");
  await this.save();
  return;
};

AccountSchema.methods.accountLost = function () {
  this.status = "Review";
  this.addActivity("Account lost", "Account lost");
  this.eventsTimestamp.lostDate = new Date();
};

AccountSchema.methods.payoutRequestDone = async function () {
  this.status = "PayoutRequestDone";
  this.payoutRequestDate.day = null;
  this.payoutRequestDate.month = null;
  this.addActivity("Payout request done", "Payout request done");
  this.eventsTimestamp.profitsSendedDate = new Date();
  await this.save();
};

AccountSchema.methods.moneySended = async function () {
  this.status = "MoneySended";
  this.addActivity("Payout request done", "Payout request done");
  this.metadata.timesPaid = this.metadata.timesPaid + 1;
  this.eventsTimestamp.payoutRequestDoneDate = new Date();
  await this.save();
};

// GET METHODS
AccountSchema.methods.getStopLossPoints = function (pair) {
  const daySchedule = Settings.GetDaySchedule();
  const pairObj = Settings.GetPairDetails(pair);
  if (!pairObj) throw new Error("No pair details found from getStopLossPoints");
  const minimumPoints = daySchedule.mode === "slow" ? pairObj.slowMode.minimumPoints : pairObj.fastMode.minimumPoints;
  return Math.round(minimumPoints + minimumPoints * Math.random() * 0.15);
};
AccountSchema.methods.getStopLossAmount = function () {
  const company = Settings.GetCompany(this.company);
  const maxRiskPerTradePercentage = company.phases[this.phase].maxRiskPerTrade;
  const randomRiskPercentage = maxRiskPerTradePercentage * Settings.GetRandomFactor();
  const riskAmount = Math.round(this.capital * randomRiskPercentage);
  return riskAmount;
};
AccountSchema.methods.getLots = function (pair, stopLossPoints, riskAmount) {
  const pairObj = Settings.GetPairDetails(pair);
  const pointValue = pairObj.pointValue;
  const lots = parseFloat((riskAmount / (stopLossPoints * pointValue)).toFixed(2));
  return lots;
};
AccountSchema.methods.getTakeProfit = function (pair, stopLossPoints, lots) {
  const daySchedule = Settings.GetDaySchedule();
  const pairObj = Settings.GetPairDetails(pair);

  const maximumSettingsTakeProfitPoints = daySchedule.mode === "slow" ? pairObj.slowMode.maximumPoints : pairObj.fastMode.maximumPoints;
  const maxStopLossTakeProfitPoints = stopLossPoints * Settings.Strategy.maxRiskToRewardRatio;
  const maxTakeProfitPoints = Math.min(maximumSettingsTakeProfitPoints, maxStopLossTakeProfitPoints);
  const maxTakeProfitAmount = maxTakeProfitPoints * pairObj.pointValue * lots;
  const company = Settings.GetCompany(this.company);
  const targetBalance = this.capital * (1 + company.phases[this.phase].target);
  const remainingBalance = targetBalance - this.balance;
  let takeProfit = {};
  if (remainingBalance < maxTakeProfitAmount) {
    if (remainingBalance / this.capital < 0.004) {
      const newLots = lots / 3;
      takeProfit.amount = Math.round(remainingBalance + pairObj.spread * newLots * pairObj.pointValue + company.commissionFactor * newLots * pairObj.pointValue + Settings.Strategy.extraTakeProfitPoints * newLots * pairObj.pointValue);
      takeProfit.lowTp = true;
      return takeProfit;
    }
    takeProfit.amount = Math.round(remainingBalance + pairObj.spread * lots * pairObj.pointValue + company.commissionFactor * lots * pairObj.pointValue + Settings.Strategy.extraTakeProfitPoints * lots * pairObj.pointValue);
  } else {
    takeProfit.amount = Math.round(maxTakeProfitAmount * Settings.GetRandomFactor());
  }
  return takeProfit;
};

// UPDATE METHODS
AccountSchema.methods.updateBalance = async function (newBalance) {
  this.addActivity("Balance updated", `Balance updated from ${this.balance} to ${newBalance}`);
  this.balance = newBalance;
  await this.save();
  return;
};

AccountSchema.methods.addActivity = function (title, description) {
  this.activities.push({
    title: title,
    description: description,
  });
};

AccountSchema.methods.updatePayoutRequestDate = async function (day, month) {
  this.payoutRequestDate.day = day;
  this.payoutRequestDate.month = month;
  await this.save();
  return;
};

AccountSchema.methods.disableTrades = async function () {
  this.tradesDisabled = true;
  await this.save();
  return;
};

AccountSchema.methods.enableTrades = async function () {
  this.tradesDisabled = false;
  await this.save();
  return;
};

export default mongoose.models.Account || mongoose.model("Account", AccountSchema);
