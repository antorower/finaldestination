import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cc: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subject: {
      type: String,
      required: true,
    },
    notifySender: Boolean,
    notifyRecipient: Boolean,
    status: {
      type: String,
      enum: ["open", "closed", "pending"],
      default: "open",
    },
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Methods
TicketSchema.methods.addMessage = function (sender, content) {
  this.messages.push({ sender, content, timestamp: new Date() });
  return this.save();
};

TicketSchema.methods.changeStatus = function (newStatus) {
  if (["open", "closed", "pending"].includes(newStatus)) {
    this.status = newStatus;
    return this.save();
  }
  throw new Error("Invalid status");
};

TicketSchema.index({ status: 1, sender: 1 });
TicketSchema.index({ status: 1, recipient: 1 });
TicketSchema.index({ status: 1, cc: 1 });

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
