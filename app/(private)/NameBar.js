export const dynamic = "force-dynamic";

import ToggleActiveButton from "./ToggleActiveButton";
import Link from "next/link";
import InfoButton from "@/components/InfoButton";
import dbConnect from "@/dbConnect";
import { revalidatePath } from "next/cache";
import User from "@/models/User";

const ToggleStatus = async ({ id, status }) => {
  "use server";
  await dbConnect();
  try {
    await User.updateOne({ _id: id }, { $set: { status: status } });
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην ToogleActive στο root", error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const NameBar = ({ user }) => {
  return (
    <div className={`${user.status === "active" ? "bg-blue-500" : "bg-red-500"} rounded flex justify-center items-center p-4 gap-4 transition-colors duration-300`}>
      <ToggleActiveButton ToggleStatus={ToggleStatus} id={user._id.toString()} status={user.status} />
      <Link href="/" className="sm:text-xl text-white text-center text-sm font-black">
        {user.firstName.toUpperCase()} {user.lastName.toUpperCase()}
      </Link>
      <InfoButton classes="text-base" message="Πατώντας το στρογγυλό κουμπί στα αριστερά μπορείς να αλλάξεις το status σου. Αν είσαι κόκκινος σημαίνει ότι ο αλγόριθμος από εδω και πέρα δεν θα σε συμπεριλαμβάνει στα trades της επόμενης ημέρας" />
    </div>
  );
};

export default NameBar;
