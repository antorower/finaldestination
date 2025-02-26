"use server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/dbConnect";
import Ticket from "@/models/Ticket";

export const OpenTicket = async ({ user, sender, account, trade, invoice, subject, notifyUser, notifyAdmin, message }) => {
  if (!user) return { error: true, message: "Ο user απαιτείται" };
  if (!subject) return { error: true, message: "Το θέμα είναι απαραίτητο" };
  if (!message) return { error: true, message: "Το μύνημα είναι απαραίτητο" };
  try {
    await dbConnect();
    const newTicket = new Ticket({
      user,
      account: account || null,
      trade: trade || null,
      invoice: invoice || null,
      subject,
      status: "open",
      notifyUser,
      notifyAdmin,
    });
    const newMessage = {
      sender,
      content: message,
    };
    if (message) newTicket.messages.push(newMessage);
    await newTicket.save();
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε ένα error στην AddActivity: ", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};
