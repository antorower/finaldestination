export const dynamic = "force-dynamic";

import dbConnect from "@/dbConnect";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import AddBeneficiaryForm from "./AddBeneficiaryForm";
import RemoveBeneficiaryForm from "./RemoveBeneficiaryForm";

const GetUser = async (id) => {
  "use server";
  try {
    await dbConnect();
    return await User.findById(id).populate({
      path: "beneficiaries.user",
      model: "User",
      select: "firstName lastName bybitEmail", // Επιλέξτε τα πεδία που θέλετε να συμπεριλάβετε
    });
  } catch (error) {
    console.log("Υπήρξε error στην GetUser στο /admin/trader/[id]", error);
    return false;
  }
};

const AddBeneficiary = async ({ userId, beneficiaryId, percentage }) => {
  "use server";
  try {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) return { error: true, message: "Ο χρήστης δεν βρέθηκε" };
    user.beneficiaries.push({ user: beneficiaryId, percentage: percentage });
    await user.save();
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην AddBeneficiary στο /admin/trader", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const RemoveBeneficiary = async ({ userId, beneficiaryId }) => {
  "use server";
  try {
    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return { error: true, message: "Ο χρήστης δεν βρέθηκε." };
    }

    // Φιλτράρουμε για να αφαιρέσουμε τον συγκεκριμένο beneficiary
    user.beneficiaries = user.beneficiaries.filter((b) => b.user.toString() !== beneficiaryId.toString());

    await user.save();

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην RemoveBeneficiary στο /admin/trader", error);
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

const BeneficiariesComponent = async ({ mode, userId }) => {
  if (mode !== "updatebeneficiaries") return null;

  const user = await GetUser(userId);
  const allUsers = await GetAllUsers();

  return (
    <div className="flex flex-col justify-center m-auto">
      <div className="text-center p-4 text-white bg-blue-500 rounded font-bold flex flex-wrap gap-4 items-center justify-center">
        {user.beneficiaries &&
          user.beneficiaries.length > 0 &&
          user.beneficiaries.map((beneficiary) => {
            return <RemoveBeneficiaryForm percentage={beneficiary.percentage} userId={user._id.toString()} beneficiaryId={beneficiary.user._id.toString()} RemoveBeneficiary={RemoveBeneficiary} firstName={beneficiary.user.firstName} lastName={beneficiary.user.lastName} key={`beneficiary-is-${beneficiary.user._id.toString()}`} className="" />;
          })}
      </div>
      <AddBeneficiaryForm userId={user._id.toString()} AddBeneficiary={AddBeneficiary} allUsers={allUsers} />
    </div>
  );
};

export default BeneficiariesComponent;
