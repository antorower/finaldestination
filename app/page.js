import AccountCard from "@/components/AccountCard";
import Menu from "@/components/Menu";
import { auth } from "@clerk/nextjs/server";
import RegisterForm from "@/components/RegisterForm";
import dbConnect from "@/dbConnect";
import { revalidatePath } from "next/cache";
import User from "@/models/User";
import { clerkClient } from "@clerk/nextjs/server";
import AddAccountLink from "@/components/AddAccountLink";

export const RegisterUser = async ({ firstName, lastName, telephone, bybitEmail, bybitUid }) => {
  "use server";
  const { sessionClaims } = await auth();

  try {
    await dbConnect();
    revalidatePath("/", "layout");
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
        owner: false,
        leader: false,
        mongoId: newUser._id.toString(),
      },
    });

    return true;
  } catch (error) {
    console.error("Error from root page on register action: ", error);
    return false;
  }
};

export const GetUser = async () => {
  "use server";
  try {
    await dbConnect();
    const { sessionClaims } = await auth();
    return await User.findOne({ clerkId: sessionClaims.userId });
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export default async function Home() {
  const user = await GetUser();
  const { sessionClaims } = await auth();

  //#region Έλεγχος User
  // Αν υπάρξει error τραβώντας τον user βγάλε μήνυμα λάθους
  if (user?.error) {
    return <div className="flex w-full h-dvh justify-center items-center">Κάτι πήγε στραβά με την φόρτωση του χρήστη</div>;
  }
  // Αν ο user δεν υπάρχει βγάλε την φόρμα εγγραφής
  if (!user) {
    return <RegisterForm RegisterUser={RegisterUser} />;
  }
  // Αν ο user δεν έχει γίνει ακόμα δεκτός του βγάζει μήνυμα
  if (!user.accepted) {
    return <div className="flex w-full h-dvh justify-center items-center">Επικοινώνησε με τον Αντώνη να σε κάνει approve συνάδελφε.</div>;
  }
  //#endregion

  let publicNote = "";
  const dayOfWeek = new Date().getDay();
  // #UpdateData Notes
  switch (dayOfWeek) {
    case 1: // Δευτέρα
      publicNote = "Δευτέρα 20/1/2025: Κλείνουμε στις 5";
      break;
    case 2: // Τρίτη
      publicNote = "Τριτη 21/1/2025: Κλείνουμε στις 6";
      break;
    case 3: // Τετάρτη
      publicNote = "Τετάρτη 22/1/2025: Κλείνουμε στις 5";
      break;
    case 4: // Πέμπτη
      publicNote = "Πέμπτη 23/1/2025: Κλείνουμε στις 5";
      break;
    case 5: // Παρασκευή
      publicNote = "Παρασκευή 24/1/2025: Κλείνουμε στις 5";
      break;
    case 6: // Σάββατο
      publicNote = "Σάββατο 25/1/2025: Το market είναι κλειστό";
      break;
    case 0: // Κυριακή
      publicNote = "Κυριακή 26/1/2025: Το market είναι κλειστό";
      break;
    default:
      publicNote = "";
  }

  return (
    <div className="flex flex-col gap-4 p-8">
      <Menu activeMenu="Profile" />
      {publicNote && publicNote !== "" && <div className="text-center p-4 bg-orange-700 w-full rounded-md text-lg font-bold">{publicNote}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AccountCard number="15485415" company="FTMO" balance={28500} phase={1} />
        <AccountCard number="15485415" company="Funded Next" balance={28500} phase={2} />
        <AccountCard number="15485415" company="FTMO" balance={28500} phase={3} />
        <AccountCard number="15485415" company="FTMO" balance={28500} phase={1} note="Βάλε 0.01" />
        <AccountCard number="15485415" company="FTMO" balance={28500} phase={1} />
        <AccountCard number="15485415" company="FTMO" balance={28500} phase={1} note="Βάλε 0.01" />
        <AccountCard number="15485415" company="FTMO" balance={28500} phase={1} />
        <AccountCard number="15485415" company="FTMO" balance={28500} phase={1} />
      </div>
      {sessionClaims?.metadata?.owner && (
        <div className="fixed right-8 bottom-8">
          <AddAccountLink userId="12345" />
        </div>
      )}
    </div>
  );
}
