export const dynamic = "force-dynamic";

import PageTransition from "@/components/PageTransition";
import dbConnect from "@/dbConnect";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import ScheduleForm from "./ScheduleForm";
import ManageCompanies from "./ManageCompanies";
import Company from "@/models/Company";
import AccountsList from "./AccountsList";
import Settings from "@/models/Settings";
import Trade from "@/models/Trade";
import NameBar from "./NameBar";
import FinanceBar from "./FinanceBar";
import ScheduleBar from "./ScheduleBar";
import MiniMenu from "./MiniMenu";
import TradingSection from "./TradingSection";
import UpdateBalanceSection from "./UpdateBalanceSection";
import SchedulingSection from "./SchedulingSections";
import PreparationSection from "./PreparationSection";
import AddAccountLink from "./AddAccountLink";
import AddAccountComponent from "./AddAccountComponent";
import LeaderFamilyBar from "./LeaderFamilyBar";
import AdminMenu from "./AdminMenu";
import AddLeaderComponent from "./AddLeaderComponent";
import AddFamilyComponent from "./AddFamilyComponent";
import IncomeComponent from "./IncomeComponent";
import BeneficiariesComponent from "./BeneficiariesComponent";
import BeneficiariesBar from "./BeneficiariesBar";
import TeamComponent from "./TeamComponent";
import TeamBar from "./TeamBar";
import StatsComponent from "./StatsComponent";
import ActiveDaysBar from "./ActiveDaysBar";

const GetUser = async (id) => {
  await dbConnect();
  try {
    return await User.findById(id)
      .populate("companies")
      .populate({
        path: "accounts",
        populate: { path: "company" },
      })
      .populate("leader")
      .populate("family")
      .populate("team")
      .populate({
        path: "beneficiaries.user",
        model: "User",
        select: "firstName lastName bybitEmail", // Επιλέξτε τα πεδία που θέλετε να συμπεριλάβετε
      });
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

const SaveSchedule = async ({ id, startingHour, endingHour }) => {
  "use server";
  try {
    if (Number(startingHour) >= Number(endingHour)) return { error: true, message: "Οι ώρες θα πρέπει να έχουνε λογική" };
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

const GetTrades = async (userId) => {
  "use server";
  try {
    await dbConnect();
    return await Trade.find({
      $or: [
        { "firstParticipant.user": userId, "firstParticipant.status": { $ne: "closed" } },
        { "secondParticipant.user": userId, "secondParticipant.status": { $ne: "closed" } },
      ],
      status: { $nin: ["completed"] }, // Προστέθηκε το φίλτρο για να αποκλείσουμε αυτά τα status
    })
      .populate("firstParticipant.user", "hourOffsetFromGreece")
      .populate("secondParticipant.user", "hourOffsetFromGreece")
      .populate("firstParticipant.account", "number balance phase")
      .populate("secondParticipant.account", "number balance phase")
      .lean();
  } catch (error) {
    console.log("Υπήρξε error στην GetTrades στο root ", error);
    return false;
  }
};

const ChangeTimePreference = async ({ id, preference }) => {
  "use server";
  try {
    await dbConnect();
    const user = await User.findById(id);
    if (!user) return { error: true, message: "Ο χρήστης δεν βρέθηκε" };
    user.timePreference = preference;
    await user.save();
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην ChangeTimePreferences στο root", error);
    return { erorr: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const ChangeModePreference = async ({ id, preference }) => {
  "use server";
  try {
    await dbConnect();
    const user = await User.findById(id);
    if (!user) return { error: true, message: "Ο χρήστης δεν βρέθηκε" };
    user.modePreference = preference;
    await user.save();
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην ChangeTimePreferences στο root", error);
    return { erorr: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

export default async function Home({ searchParams }) {
  const { mode, userid, accountcheck, tradecheck } = await searchParams;

  // Αφορούν τον user που κάνει επίσκεψη
  const { sessionClaims } = await auth();
  const { isOwner, isLeader, mongoId } = sessionClaims.metadata;

  // Ο user που θέλουμε να δούμε
  const user = await GetUser(userid ? userid : mongoId);
  if (!user) return <div className="flex justify-center animate-pulse text-gray-700">Δεν βρέθηκε user</div>;
  // Τα data από την βάση δεδομένων για τον user που βλέπουμε
  const settings = await GetSettings();
  if (!settings) return <div className="flex justify-center animate-pulse text-gray-700">Δεν βρέθηκαν settings</div>;
  const trades = await GetTrades(user._id.toString());
  const companies = await GetCompanies();

  // Ξεχωρίζω τα trades σε κατηγορίες
  const forOpening = [];
  const openTrades = [];
  const tradeSuggestions = [];
  if (trades && trades.length > 0) {
    trades.forEach((trade) => {
      let participant = null;
      // Βρίσκουμε αν ο χρήστης είναι first ή second participant
      if (trade.firstParticipant?.user?._id.toString() === user._id.toString()) {
        participant = trade.firstParticipant;
      } else if (trade.secondParticipant?.user?._id.toString() === user._id.toString()) {
        participant = trade.secondParticipant;
      }
      // Αν δεν βρέθηκε participant, προχωράμε στο επόμενο trade
      if (!participant) return;

      // 1️⃣ tradeSuggestions → (Participant: pending, accepted, canceled) & (Trade: pending)
      if (["pending", "accepted", "canceled"].includes(participant.status) && trade.status === "pending") {
        tradeSuggestions.push(trade);
      }

      // 2️⃣ forOpening → (Trade: accepted)
      if (trade.status === "accepted") {
        forOpening.push(trade);
      }

      // 3️⃣ openTrades → (Participant: open)
      if (participant.status === "open") {
        openTrades.push(trade);
      }
    });
  }

  // Ώρα της Ελλάδας σε ακέραιο αριθμό
  const GreeceTime = Number(new Date().toLocaleString("en-US", { timeZone: "Europe/Athens", hour: "numeric", hour12: false }));

  // Εταιρίες που έχει ενεργές ο χρήστης
  const simpleCompanies = user.companies.length > 0 ? user.companies.map((company) => ({ _id: company._id.toString(), name: company.name })) : [];

  const getCurrentDayName = (offset = 0) => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = new Date();
    today.setHours(GreeceTime, 0, 0, 0); // Ρυθμίζουμε την ώρα Ελλάδας για ακρίβεια
    return days[(today.getDay() + offset) % 7];
  };

  const currentPhase = () => {
    if (GreeceTime >= settings.tradingHours.startingHour && GreeceTime < settings.tradingHours.endingHour) return "trading";
    if (GreeceTime >= settings.updateBalanceHours.startingHour && GreeceTime < settings.updateBalanceHours.endingHour) return "updateBalance";
    if (GreeceTime >= settings.acceptTradesHours.startingHour && GreeceTime < settings.acceptTradesHours.endingHour) return "acceptTrades";
    if (GreeceTime >= settings.seeScheduleHours.startingHour && GreeceTime < settings.seeScheduleHours.endingHour) return "seeSchedule";
    return "outside";
  };

  const activeDay = currentPhase() === "trading" || currentPhase() === "updateBalance" ? getCurrentDayName() : getCurrentDayName(1);
  const note = settings[activeDay]?.note || "Δεν υπάρχει ώρα κλεισίματος";

  const closeHour = settings[activeDay].closeHour.hour + user.hourOffsetFromGreece;
  if (closeHour === 0) closeHour = 12;
  if (closeHour === -1) closeHour = 11;
  if (closeHour === -2) closeHour = 10;

  return (
    <PageTransition>
      <div className="flex flex-col gap-4 pb-4">
        <NameBar user={user} />
        {isOwner && <AdminMenu userid={userid} />}
        {isOwner && <BeneficiariesBar beneficiaries={user.beneficiaries} />}
        {user.team && user.team.length > 0 && <TeamBar team={user.team} />}
        <LeaderFamilyBar leader={user.leader ? `${user.leader?.firstName.slice(0, 1)}. ${user.leader?.lastName}` : null} family={user.family ? `${user.family?.firstName.slice(0, 1)}. ${user.family?.lastName}` : null} />
        <FinanceBar user={user} />
        <ScheduleBar GreeceTime={GreeceTime} user={user} settings={settings} />
        <ActiveDaysBar mon={settings.monday.active} tue={settings.tuesday.active} wed={settings.wednesday.active} thu={settings.thursday.active} fri={settings.friday.active} />

        {settings[activeDay]?.closeHour?.hour && settings[activeDay]?.closeHour?.minutes && (
          <>
            <div className="text-center bg-indigo-700 text-white animate-pulse p-4 text-2xl font-bold rounded">
              Κλείνουμε {closeHour}:{settings[activeDay].closeHour.minutes}
            </div>

            <div className="bg-gray-100 p-4 rounded text-center">Σημείωση: Η παραπάνω ώρα κλεισίματος αφορά πάντα το επόμενο κλείσιμο που έχουμε να κάνουμε. Αυτό σημαίνει ότι πριν τις 5 θα δείχνει την ώρα που πρέπει να κλείσουμε την τρέχουσα ημέρα, μετά τις 5 θα δείχνει την ώρα που πρέπει να κλείσουμε την επόμενη ημέρα.</div>
            <div className="text-center font-bold bg-black text-white rounded p-4 text-xl">
              ΔΕΝ κλείνουμε 10 λεπτά νωρίτερα, ΔΕΝ κλείνουμε 10 λεπτά αργότερα. ΔΕΝ κλείνουμε όταν μπορέσουμε. ΔΕΝ κλείνουμε αμέσως μόλις βγούμε διάλλειμα από την δουλειά. ΔΕΝ κάνουμε του κεφαλιού μας και μετά λέμε την δικαιολογία μας. ΔΕΝ ενδιαφέρει κανέναν η δικαιολογία σου. Το μόνο που μας ΕΝΔΙΑΦΕΡΕΙ είναι να μην πετάξουμε τα λεφτά μας!! Ξαναγράφω: ΔΕΝ ενδιαφέρει κανέναν η δικαιολογία σου. Το μόνο που μας ενδιαφέρει είναι να μην πετάξουμε τα λεφτά μας!!
            </div>
          </>
        )}

        <div className="grid grid-cols-12 gap-4">
          <MiniMenu userid={userid} />
          <div className="col-span-12 md:col-span-9 xl:col-span-10 px-4 overflow-y-auto flex flex-col gap-4 pb-8">
            <TradingSection tradecheck={tradecheck} accountcheck={accountcheck} GreeceTime={GreeceTime} settings={settings} user={user} forOpening={forOpening} mode={mode} />
            <UpdateBalanceSection GreeceTime={GreeceTime} settings={settings} openTrades={openTrades} user={user} mode={mode} />
            <SchedulingSection GreeceTime={GreeceTime} settings={settings} user={user} tradeSuggestions={tradeSuggestions} mode={mode} />
            <PreparationSection GreeceTime={GreeceTime} settings={settings} user={user} forOpening={forOpening} mode={mode} />
            <AccountsList mode={mode} accounts={user.accounts.sort((a, b) => a.phase - b.phase)} />
            <ScheduleForm
              mode={mode}
              SaveSchedule={SaveSchedule}
              ChangeTimePreference={ChangeTimePreference}
              ChangeModePreference={ChangeModePreference}
              ToggleFlexibleSuggestions={ToggleFlexibleSuggestions}
              ChangeHourOffsetFromGreece={ChangeHourOffsetFromGreece}
              id={user._id.toString()}
              oldStartingHour={user.tradingHours.startingTradingHour}
              oldEndingHour={user.tradingHours.endingTradingHour}
              oldSuggestionsStatus={user.flexibleTradesSuggestions}
              oldOffset={user.hourOffsetFromGreece}
              timePref={user.timePreference}
              modePref={user.modePreference}
            />
            <ManageCompanies mode={mode} userId={user._id.toString()} allCompanies={companies} userCompanies={user.companies} />
            <AddAccountComponent mode={mode} id={user._id.toString()} companies={simpleCompanies} />
            <AddLeaderComponent mode={mode} userId={user._id.toString()} />
            <AddFamilyComponent mode={mode} userId={user._id.toString()} />
            <IncomeComponent mode={mode} user={user} />
            <BeneficiariesComponent mode={mode} userId={user._id.toString()} />
            <TeamComponent mode={mode} user={user} />
          </div>
        </div>

        <StatsComponent user={user} />
        {isOwner && (
          <div className="fixed bottom-5 right-5">
            <AddAccountLink userid={userid} />
          </div>
        )}
      </div>
    </PageTransition>
  );
}

//<MenuItem link={`/?mode=tickets${userid ? `&userid=${userid}` : ""}`} name="Tickets" icon="/tickets.svg" size={18} />
