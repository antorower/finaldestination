export const dynamic = "force-dynamic";

import ShareForm from "./ShareForm";
import SalaryForm from "./SalaryForm";
import dbConnect from "@/dbConnect";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

const SaveSalary = async ({ userId, salary }) => {
  "use server";
  try {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) return { error: true, message: "Ο χρήστης δεν βρέθηκε" };
    user.salary = salary;
    await user.save();
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε ένα error στην SaveSalary στο /admin/trader/[id]", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const SaveShare = async ({ userId, share }) => {
  "use server";
  try {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) return { error: true, message: "Ο χρήστης δεν βρέθηκε" };
    user.share = share;
    await user.save();
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε ένα error στην SaveShare στο /admin/trader/[id]", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const IncomeComponent = ({ mode, user }) => {
  if (mode !== "updateincome") return null;

  return (
    <div className="flex justify-center m-auto gap-8">
      <ShareForm SaveShare={SaveShare} userId={user._id.toString()} userShare={user.share || 0} />
      <SalaryForm SaveSalary={SaveSalary} userId={user._id.toString()} userSalary={user.salary || 0} />
    </div>
  );
};

export default IncomeComponent;
