export const dynamic = "force-dynamic";

import dbConnect from "@/dbConnect";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import AddFamilyForm from "./AddFamilyForm";

const SetFamily = async ({ userId, familyId }) => {
  "use server";
  try {
    await dbConnect();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { family: familyId },
      { new: true } // Επιστρέφει το ενημερωμένο user object
    );

    if (!updatedUser) {
      return { error: true, message: "Ο χρήστης δεν βρέθηκε." };
    }

    return { error: false, message: "Ο αρχηγός ενημερώθηκε επιτυχώς." };
  } catch (error) {
    console.log("Υπήρξε error στην SetFamily στο /admin/trader", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const GetAllUsers = async () => {
  "use server";
  try {
    await dbConnect();
    return await User.find()
      .select("_id firstName lastName")
      .lean()
      .then((users) => users.map((user) => ({ ...user, _id: user._id.toString() })));
  } catch (error) {
    console.log("Υπήρξε error στην GetAllUsers", error);
    return false;
  }
};

const AddFamilyComponent = async ({ mode, userId }) => {
  if (mode !== "updatefamily") return null;
  const allUsers = await GetAllUsers();
  return <AddFamilyForm allUsers={allUsers} userId={userId} SetFamily={SetFamily} />;
};

export default AddFamilyComponent;
