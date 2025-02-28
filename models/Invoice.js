import mongoose from "mongoose";
import User from "./User";

const InvoiceSchema = new mongoose.Schema(
  {
    // 🟢 Users & Account
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    trade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trade",
    },

    // 🟢 Details
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["User Commission", "Leader Commission", "User Payment", "Buy Account", "Mistake", "Bonus", "Add Profits", "Add Dept"],
      required: true,
    },

    // 🟢 Finance
    amount: {
      type: Number,
      default: 0,
      min: -20000,
      max: 20000,
    },
    transferred: {
      type: Boolean,
      default: false,
    },
    amountTransferred: {
      type: Number,
      default: 0,
    },

    // 🟢 Status
    status: {
      type: String,
      enum: ["Pending", "Completed", "Canceled"],
      default: "Pending",
    },
    nextMove: {
      type: String,
      enum: ["leader", "admin"],
      default: "leader",
    },
    adminNote: {
      type: String,
      default: "",
      trim: true,
    },
    userNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true }
);

InvoiceSchema.pre("save", async function (next) {
  try {
    if (!this.isNew) return next();

    if (this.category === "User Commission") {
      if (!this.user) throw new Error("Δεν υπάρχει χρήστης");
      if (!this.leader) throw new Error("Δεν υπάρχει leader");
      if (!this.account) throw new Error("Δεν υπάρχει account");
      this.status = "Completed";
    }

    if (this.category === "Leader Commission") {
      if (!this.user) throw new Error("Δεν υπάρχει χρήστης");
      if (!this.leader) throw new Error("Δεν υπάρχει leader");
      if (!this.account) throw new Error("Δεν υπάρχει account");

      if (this.amount !== 0) {
        const user = await User.findById(this.user).select("_id");
        if (!user) throw new Error("Δεν βρέθηκε ο χρήστης");
        await user.addProfits(this.amount);
      }

      this.status = "Completed";
    }

    if (this.category === "User Payment") {
      if (!this.user) throw new Error("Δεν υπάρχει χρήστης");
      if (!this.leader) throw new Error("Δεν υπάρχει leader");

      const user = await User.findById(this.user).select("_id");
      if (!user) throw new Error("Δεν βρέθηκε ο χρήστης");
      await user.addProfits(-this.amount);

      this.status = "Completed";
    }

    if (this.category === "Buy Account") {
      if (!this.user) throw new Error("Δεν υπάρχει χρήστης");
      if (!this.leader) throw new Error("Δεν υπάρχει leader");
      if (!this.account) throw new Error("Δεν υπάρχει account");

      this.status = "Completed";
    }

    if (this.category === "Mistake") {
      if (!this.user) throw new Error("Δεν υπάρχει χρήστης");
      if (!this.leader) throw new Error("Δεν υπάρχει leader");
      if (!this.account) throw new Error("Δεν υπάρχει account");

      const leader = await User.findById(this.leader).select("_id");
      if (!leader) throw new Error("Δεν βρέθηκε ο leader");
      await leader.addProfits(-this.amount);
    }

    if (this.category === "Add Profits") {
      if (!this.user) throw new Error("Δεν υπάρχει χρήστης");
      if (!this.leader) throw new Error("Δεν υπάρχει leader");

      const user = await User.findById(this.user).select("_id");
      if (!user) throw new Error("Δεν βρέθηκε ο χρήστης");
      await user.addProfits(this.amount);

      this.status = "Completed";
    }

    if (this.category === "Add Dept") {
      if (!this.user) throw new Error("Δεν υπάρχει χρήστης");
      if (!this.leader) throw new Error("Δεν υπάρχει leader");

      const user = await User.findById(this.user).select("_id");
      if (!user) throw new Error("Δεν βρέθηκε ο χρήστης");
      await user.addDept(this.amount);

      this.status = "Completed";
    }
  } catch (error) {
    error.message = "Σφάλμα κατά την αποθήκευση του τιμολογίου: " + error.message;
    throw error;
  }
});

InvoiceSchema.methods.transferDept = async function (amount) {
  try {
    if (this.category !== "Mistake") throw new Error("Από αυτήν την κατηγορία τιμολογίου δεν γίνεται να μεταφέρεις χρέος");
    if (!this.user) throw new Error("Δεν υπάρχει χρήστης");
    if (!this.leader) throw new Error("Δεν υπάρχει leader");
    if (amount > this.amount) throw new Error("Το ποσό προς χρέωση δεν μπορεί να είναι μεγαλύτερο του συνολικού ποσού");

    this.amountTransferred = amount;
    this.transferred = true;
    await this.save();

    const user = await User.findById(this.user).select("_id");
    if (!user) throw new Error("Δεν βρέθηκε χρήστης");
    await user.addDept(amount);
  } catch (error) {
    error.message = "Σφάλμα κατά τη μεταφορά χρέους: " + error.message;
    throw error;
  }
};

InvoiceSchema.methods.cancel = async function () {
  try {
    if (!this.user) throw new Error("Δεν υπάρχει χρήστης");
    if (!this.leader) throw new Error("Δεν υπάρχει leader");
    if (this.status === "Canceled") throw new Error("Το τιμολόγιο αυτό είναι ήδη ακυρωμένο");

    if (this.category === "Mistake") {
      if (this.transferred) {
        const user = await User.findById(this.user).select("_id");
        if (!user) throw new Error("Δεν βρέθηκε χρήστης");
        await user.addDept(-this.amountTransferred);

        if (this.amount !== this.amountTransferred) {
          const leader = await User.findById(this.leader).select("_id");
          if (!leader) throw new Error("Δεν βρέθηκε leader");
          await leader.addProfits(this.amount - this.amountTransferred);
        }
      } else {
        const leader = await User.findById(this.leader).select("_id");
        if (!leader) throw new Error("Δεν βρέθηκε leader");
        await leader.addProfits(this.amount);
      }
    }

    if (this.category === "Leader Commission") {
      const user = await User.findById(this.user).select("_id");
      if (!user) throw new Error("Δεν βρέθηκε leader");
      await user.addProfits(-this.amount);
    }

    if (this.category === "Add Profits") {
      const user = await User.findById(this.user).select("_id");
      if (!user) throw new Error("Δεν βρέθηκε ο χρήστης");
      await user.addProfits(-this.amount);
    }

    if (this.category === "Add Dept") {
      const user = await User.findById(this.user).select("_id");
      if (!user) throw new Error("Δεν βρέθηκε ο χρήστης");
      await user.addDept(-this.amount);
    }

    this.status = "Canceled";
    await this.save();
  } catch (error) {
    error.message = "Σφάλμα κατά την ακύρωση του τιμολογίου: " + error.message;
    throw error;
  }
};

InvoiceSchema.index({ category: 1, user: 1, leader: 1 });
InvoiceSchema.index({ user: 1 });
InvoiceSchema.index({ leader: 1 });

export default mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);

/*
["User Commission", "Leader Commission", "User Payment", "Buy Account", "Mistake", "Add Profits", "Add Dept"]

User Commission & Leader Commission: Όταν ο user παίρνει payout τότε δημιουργούνται δύο invoices, ένα για τον κάθε ένα.
User Payment: Όταν ο admin πληρώνει έναν user τότε δημιουργείται ένα invoice
Buy Account: Όταν ο admin στέλνει λεφτά για αγορά account τότε δημιουργείται ένα invoice
Mistake: Όταν υπάρχει οποιαδήποτε αστοχία τότε δημιουργείται ένα invoice το οποίο χρεώνεται στον leader με δυνατότητα εκείνος να περάσει μέρος του χρέους ή όλο το χρέος στον user
Add Profits: Αν θέλω να διορθώσω κάτι και να προσθέσω ή αφαιρέσω profits σε έναν user
Add Dept: Αν θέλω να προσθέσω ή να αφαιρέσω dept σε έναν user
*/
