"use server";
import User from "@/models/User";
import Trade from "@/models/Trade";
import Account from "@/models/Account";
import { revalidatePath } from "next/cache";
import dbConnect from "@/dbConnect";
import Activity from "@/models/Activity";

export const AddActivity = async ({ user, account, trade, title, description }) => {
  try {
    await dbConnect();

    // Δημιουργία αντικειμένου με μόνο τις παραμέτρους που υπάρχουν
    const activityData = {
      ...(user && { user }),
      ...(account && { account }),
      ...(trade && { trade }),
      ...(title && { title }),
      ...(description && { description }),
    };

    // Δημιουργία νέου Activity με τα υπάρχοντα δεδομένα
    const activity = new Activity(activityData);
    await activity.save();

    return true;
  } catch (error) {
    console.log("Υπήρξε ένα error στην AddActivity: ", error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};
