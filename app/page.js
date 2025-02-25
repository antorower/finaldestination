import { UserProfile } from "@clerk/nextjs";
import PageTransition from "@/components/PageTransition";
import dbConnect from "@/dbConnect";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import ToggleActiveButton from "./ToggleActiveButton";
import { revalidatePath } from "next/cache";
import ScheduleForm from "./ScheduleForm";
import InfoButton from "@/components/InfoButton";
import ManageCompanies from "./ManageCompanies";
import Company from "@/models/Company";
import Link from "next/link";

const GetUser = async (id) => {
  await dbConnect();
  try {
    return await User.findById(id).populate("companies").populate("leader").populate("family").populate("team").populate("beneficiaries");
  } catch (error) {
    console.log("Υπήρξε error στην GetUser στο root", error);
    return false;
  }
};

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

const SaveSchedule = async ({ id, startingHour, endingHour }) => {
  "use server";
  try {
    if (startingHour >= endingHour) return { error: true, message: "Οι ώρες θα πρέπει να έχουμε λογική" };
    const tradingHours = { startingTradingHour: startingHour, endingTradingHour: endingHour };
    await dbConnect();
    await User.updateOne({ _id: id }, { $set: { tradingHours: tradingHours } });
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην SaveSchedule στο root", error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const ToggleFlexibleSuggestions = async ({ id, status }) => {
  "use server";
  try {
    await dbConnect();
    await User.updateOne({ _id: id }, { $set: { flexibleTradesSuggestions: status } });
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην ToggleFlexibleSuggestions στο root", error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const ChangeHourOffsetFromGreece = async ({ id, offset }) => {
  "use server";
  try {
    await dbConnect();
    await User.updateOne({ _id: id }, { $set: { hourOffsetFromGreece: offset } });
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην ChangeHourOffsetFromGreece στο root", error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const GetCompanies = async () => {
  "use server";
  try {
    await dbConnect();
    return await Company.find();
  } catch (error) {
    console.log(error);
    return { error: true, message: error.message };
  }
};

export default async function Home({ searchParams }) {
  const { sessionClaims } = await auth();
  const user = await GetUser(sessionClaims.metadata.mongoId);
  const { mode } = await searchParams;
  console.log(mode);

  const status = user.status;
  const id = user._id.toString();

  const companies = await GetCompanies();

  return (
    <PageTransition>
      <div className="flex flex-col gap-4">
        <div className={`${status === "active" ? "bg-blue-500" : "bg-red-500"} rounded flex justify-center items-center p-4 gap-4 transition-colors duration-300`}>
          <ToggleActiveButton ToggleStatus={ToggleStatus} id={id} status={status} />
          <Link href="/" className="sm:text-xl text-white text-center text-sm font-black">
            {user.firstName.toUpperCase()} {user.lastName.toUpperCase()}
          </Link>
          <InfoButton classes="text-base" message="Πατώντας το στρογγυλό κουμπί στα αριστερά μπορείς να αλλάξεις το status σου. Αν είσαι κόκκινος σημαίνει ότι ο αλγόριθμος από εδω και πέρα δεν θα σε συμπεριλαμβάνει στα trades της επόμενης ημέρας" />
        </div>

        <div className="flex items-center px-4 py-2 bg-gray-50 justify-between rounded border border-gray-300 text-gray-600 text-sm">
          <div>Κέρδη: ${user.profits}</div>
          <div className="flex items-center gap-2">
            <div>Χρέος: ${user.dept}</div>
            <InfoButton classes="text-sm" message="Ο διαχειριστής έχει την δυνατότητα να μεταφέρει το κόστος ενός λάθους, ή μέρος αυτού, στον trader που το έκανε. Αυτό αφαιρείται άμεσα από τα κέρδη. Στην περίπτωση που δεν υπάρχουν όμως προστίθενται στο χρέος και αφαιρούνται από το μερίδιο του επόμενου payout μέχρι εξοφλήσεως." />
          </div>
          {user.salary !== 0 && <div> Μισθός: ${user.salary}/μήνα</div>}
          {user.share == 0 && <div className="hidden sm:block"> Ποσοστό: {user.salary}%</div>}
        </div>

        <div className="flex items-center px-4 py-2 bg-gray-50 justify-center lg:justify-between rounded border border-gray-300 text-gray-600 text-sm">
          <Link className="text-blue-500 font-semibold" href={`/?mode=tradingsettings`}>
            Ρυθμίσεις
          </Link>

          <div className="hidden lg:flex gap-4 justify-center">
            <ManageCompanies userId={user._id.toString()} allCompanies={companies} userCompanies={user.companies} />
            <InfoButton message="Πάτησε πάνω και ενεργοποίησε όποιες εταιρείες θέλεις να παίζεις. Αν κάποια εταιρεία δεν θέλεις να την παίζεις απλά απενεργοποίησε την." />
          </div>
        </div>

        {mode === "tradingsettings" && (
          <div className="flex justify-center">
            <ScheduleForm SaveSchedule={SaveSchedule} ToggleFlexibleSuggestions={ToggleFlexibleSuggestions} ChangeHourOffsetFromGreece={ChangeHourOffsetFromGreece} id={id} oldStartingHour={user.tradingHours.startingTradingHour} oldEndingHour={user.tradingHours.endingTradingHour} oldSuggestionsStatus={user.flexibleTradesSuggestions} oldOffset={user.hourOffsetFromGreece} />
          </div>
        )}
      </div>
    </PageTransition>
  );
}
