export const dynamic = "force-dynamic";

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
import AccountsList from "./AccountsList";
import Image from "next/image";
import Settings from "@/models/Settings";
import Account from "@/models/Account";

const GetUser = async (id) => {
  await dbConnect();
  try {
    return await User.findById(id).populate("companies").populate("accounts").populate("leader").populate("family").populate("team").populate("beneficiaries");
  } catch (error) {
    console.log("Υπήρξε error στην GetUser στο root:", error);
    return false;
  }
};

const GetSettings = async (id) => {
  await dbConnect();
  try {
    return await Settings.findOne();
  } catch (error) {
    console.log("Υπήρξε error στην GetSettings στο root", error);
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
  const settings = await GetSettings();
  const companies = await GetCompanies();

  if (!user || !settings) return <div className="flex justify-center animate-pulse text-gray-700">Κάτι πήγε στραβά. Κάνε refresh.</div>;
  const { mode } = await searchParams;

  const status = user.status;
  const id = user._id.toString();

  const GreeceTime = Number(new Date().toLocaleString("en-US", { timeZone: "Europe/Athens", hour: "numeric", hour12: false }));

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

        <div className="grid grid-cols-12 gap-4">
          <div className="flex flex-col gap-4 xl:col-span-2">
            <div className="p-4 flex w-full flex-row flex-wrap justify-between lg:flex-col gap-4 border h-[230px] border-gray-300 rounded">
              <MenuItem link="/" name="Εργασίες" icon="account.svg" size={18} />
              <MenuItem link="/?mode=accounts" name="Accounts" icon="account.svg" size={18} />
              <MenuItem link="/?mode=tradingsettings" name="Ρυθμίσεις" icon="/settings-icon.svg" size={18} />
              <MenuItem link="/?mode=tickets" name="Tickets" icon="/tickets.svg" size={18} />
              <MenuItem link="/?mode=companies" name="Εταιρίες" icon="/company-icon.svg" size={18} info="Πάτησε πάνω και ενεργοποίησε όποιες εταιρείες θέλεις να παίζεις. Αν κάποια εταιρεία δεν θέλεις να την παίζεις απλά απενεργοποίησε την." />
            </div>
            <div className="col-span-12 h-[400px] lg:col-span-4 xl:col-span-3 p-4 border border-gray-300 rounded overflow-y-auto overflow-x-hidden">
              <div className="">context</div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5 xl:col-span-10 px-4 overflow-y-auto h-[646px] p-4">
            {mode === "accounts" && <AccountsList accounts={user.accounts.sort((a, b) => a.phase - b.phase)} />}
            {mode === "tradingsettings" && (
              <div className="flex justify-center">
                <ScheduleForm SaveSchedule={SaveSchedule} ToggleFlexibleSuggestions={ToggleFlexibleSuggestions} ChangeHourOffsetFromGreece={ChangeHourOffsetFromGreece} id={id} oldStartingHour={user.tradingHours.startingTradingHour} oldEndingHour={user.tradingHours.endingTradingHour} oldSuggestionsStatus={user.flexibleTradesSuggestions} oldOffset={user.hourOffsetFromGreece} />
              </div>
            )}
            {mode === "tickets" && <div className="w-full text-center animate-pulse text-gray-400">Under Construction</div>}
            {mode === "companies" && (
              <div className="w-full text-center text-gray-400">
                <ManageCompanies userId={user._id.toString()} allCompanies={companies} userCompanies={user.companies} />
              </div>
            )}
            {!mode && (
              <div className="flex flex-col gap-4">
                {GreeceTime >= settings.tradingHours.startingHour && GreeceTime < settings.tradingHours.endingHour && (
                  <div>
                    <div>Trading Hour</div>
                    <div>context</div>
                  </div>
                )}
                {GreeceTime >= settings.updateBalanceHours.startingHour && GreeceTime < settings.updateBalanceHours.endingHour && (
                  <div>
                    <div>Update Balance</div>
                    <div>context</div>
                  </div>
                )}
                {GreeceTime >= settings.acceptTradesHours.startingHour && GreeceTime < settings.acceptTradesHours.endingHour && (
                  <div>
                    <div>Accept Trades Hours</div>
                    <div>context</div>
                  </div>
                )}
                {GreeceTime >= settings.seeScheduleHours.startingHour && GreeceTime < settings.seeScheduleHours.endingHour && (
                  <div>
                    <div>See Schedule Hours</div>
                    <div>context</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

const MenuItem = ({ name, link, info, icon, size }) => {
  return (
    <Link className="text-blue-500 font-semibold hover:text-blue-400 flex items-center justify-between gap-4" href={link}>
      <div className="flex items-center gap-4">
        <Image src={icon} alt="" width={size} height={size} />
        <div>{name}</div>
      </div>
      {info && <InfoButton message={info} />}
    </Link>
  );
};
