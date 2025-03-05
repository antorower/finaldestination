import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import RegisterForm from "@/components/RegisterForm";
import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/dbConnect";
import User from "@/models/User";

export const RegisterUser = async ({ firstName, lastName, telephone, bybitEmail, bybitUid }) => {
  "use server";
  const { sessionClaims } = await auth();

  try {
    await dbConnect();
    const newUser = new User({
      clerkId: sessionClaims.userId,
      firstName: firstName,
      lastName: lastName,
      telephone: telephone,
      bybitEmail: bybitEmail,
      bybitUid: bybitUid,
    });
    await newUser.save();

    const client = await clerkClient();
    await client.users.updateUserMetadata(sessionClaims.userId, {
      publicMetadata: {
        isOwner: false,
        isAdmin: false,
        isLeader: false,
        mongoId: newUser._id.toString(),
        registered: true,
        accepted: false,
      },
    });

    return { error: false, message: "Η εγγραφή σου έγινε επιτυχώς" };
  } catch (error) {
    console.error("Error κατά την διάρκεια εγγραφής: ", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const Register = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr] h-dvh bg-gray-50">
      <div className="relative w-full h-full hidden md:block">
        <Image src="/business-man.jpg" alt="Επαγγελματίας άνδρας" fill style={{ objectFit: "cover", objectPosition: "center top" }} quality={50} priority />
      </div>
      <div className="p-4 overflow-y-auto flex flex-col gap-2 w-full items-center justify-center">
        <RegisterForm RegisterUser={RegisterUser} />
      </div>
    </div>
  );
};

export default Register;
