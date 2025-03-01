import mongoose from "mongoose";
import Pair from "./Pair";

const SettingsSchema = new mongoose.Schema(
  {
    // 🟢 Days
    monday: {
      stringDate: { type: String, default: "" },
      pairs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pair", default: [] }],
      hours: {
        min: Date,
        max: Date,
      },
      note: { type: String, default: "" },
      active: {
        type: Boolean,
        default: false,
      },
    },
    tuesday: {
      stringDate: { type: String, default: "" },
      pairs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pair", default: [] }],
      hours: {
        min: { type: Date, default: null },
        max: { type: Date, default: null },
      },
      note: { type: String, default: "" },
      active: {
        type: Boolean,
        default: false,
      },
    },
    wednesday: {
      stringDate: { type: String, default: "" },
      pairs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pair", default: [] }],
      hours: {
        min: { type: Date, default: null },
        max: { type: Date, default: null },
      },
      note: { type: String, default: "" },
      active: {
        type: Boolean,
        default: false,
      },
    },
    thursday: {
      stringDate: { type: String, default: "" },
      pairs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pair", default: [] }],
      hours: {
        min: { type: Date, default: null },
        max: { type: Date, default: null },
      },
      note: { type: String, default: "" },
      active: {
        type: Boolean,
        default: false,
      },
    },
    friday: {
      stringDate: { type: String, default: "" },
      pairs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pair", default: [] }],
      hours: {
        min: { type: Date, default: null },
        max: { type: Date, default: null },
      },
      note: { type: String, default: "" },
      active: {
        type: Boolean,
        default: false,
      },
    },

    // 🟢 Schedule
    tradingHours: {
      startingHour: {
        type: Number,
        default: 4,
      },
      endingHour: {
        type: Number,
        default: 10,
      },
    },
    updateBalanceHours: {
      startingHour: {
        type: Number,
        default: 10,
      },
      endingHour: {
        type: Number,
        default: 18,
      },
    },
    acceptTradesHours: {
      startingHour: {
        type: Number,
        default: 18,
      },
      endingHour: {
        type: Number,
        default: 20,
      },
    },
    seeScheduleHours: {
      startingHour: {
        type: Number,
        default: 20,
      },
      endingHour: {
        type: Number,
        default: 24,
      },
    },

    // 🟢 Time Spaces Between Trades
    minutesSpaceBetweenTrades: {
      type: Number,
      default: 15,
    },
    minutesSpaceForPresenceBeforeTrade: {
      type: Number,
      default: 10,
    },

    // 🟢 Trades Settings
    targetsGap: {
      phase1: {
        type: Number,
        default: 2,
      },
      phase2: {
        type: Number,
        default: 5,
      },
      phase3: {
        type: Number,
        default: 10,
      },
    },
  },
  { timestamps: true }
);

const daysMap = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const getGreekTimezoneOffset = () => {
  const now = new Date();
  const greekTime = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Athens", timeZoneName: "short" }).formatToParts(now);
  const timeZoneString = greekTime.find((part) => part.type === "timeZoneName").value;

  return timeZoneString.includes("+03") ? 3 : 2;
};

SettingsSchema.methods.setDayHours = async function (day, startingHour, endingHour) {
  if (!this[day]) throw new Error("Invalid day provided");

  const now = new Date();
  const currentDay = now.getDay();
  const targetDay = daysMap[day.toLowerCase()];

  // Υπολογίζουμε πόσες μέρες πρέπει να προσθέσουμε
  let daysToAdd = (targetDay - currentDay + 7) % 7;

  // Αν είναι η ίδια μέρα, ελέγχουμε αν έχει περάσει η ώρα έναρξης
  if (daysToAdd === 0) {
    const currentHour = now.getHours();
    if (currentHour >= startingHour) {
      daysToAdd = 7; // Πηγαίνουμε στην επόμενη εβδομάδα
    }
  }

  // Υπολογίζουμε το offset της Ελλάδας
  const greekOffset = getGreekTimezoneOffset();

  // Δημιουργούμε την ημερομηνία-στόχο σε ώρα Ελλάδας
  const targetDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  targetDate.setHours(0, 0, 0, 0);

  // Μετατροπή από Ώρα Ελλάδας σε UTC
  const utcStartHour = startingHour - greekOffset;
  const utcEndHour = endingHour - greekOffset;

  // Δημιουργούμε τα Date objects σε UTC
  const minDate = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), utcStartHour, 0, 0, 0));

  const maxDate = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), utcEndHour, 0, 0, 0));

  // Αποθήκευση στη MongoDB
  this[day].hours.min = minDate;
  this[day].hours.max = maxDate;
  this[day].stringDate = `${["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"][targetDate.getDay()]}, ${targetDate.getDate()}/${targetDate.getMonth() + 1}/${targetDate.getFullYear()}`;
  await this.save();
};

// 🟢 Method για να προσθέτει ένα Pair στην ημέρα
SettingsSchema.methods.addPairToDay = async function (day, pairId) {
  if (!this[day]) throw new Error("Invalid day provided");

  // Προσθέτει το pairId μόνο αν δεν υπάρχει ήδη
  if (!this[day].pairs.includes(pairId)) {
    this[day].pairs.push(pairId);
    await this.save();
  }
};

// 🟢 Method για να αφαιρεί ένα Pair από την ημέρα χρησιμοποιώντας `$pull`
SettingsSchema.methods.removePairFromDay = async function (day, pairId) {
  if (!this[day]) throw new Error("Invalid day provided");

  await this.updateOne({
    $pull: { [`${day}.pairs`]: pairId },
  });
};

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
