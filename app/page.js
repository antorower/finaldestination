import Link from "next/link";
import AccountCard from "@/components/AccountCard";
import Menu from "@/components/Menu";
import { auth } from "@clerk/nextjs/server";
import RegisterForm from "@/components/RegisterForm";
import dbConnect from "@/dbConnect";
import { revalidatePath } from "next/cache";
import User from "@/models/User";
import { clerkClient } from "@clerk/nextjs/server";
import WorkingHours from "@/components/WorkingHours";
import Trade from "@/models/Trade";
import Settings from "@/models/Settings";
import PendingTrades from "@/components/PendingTrades";
import AcceptedTrades from "@/components/AcceptedTrades";
import AwareTrades from "@/components/AwareTrades";

//#region Set Functions
export const RegisterUser = async ({ firstName, lastName, telephone, bybitEmail, bybitUid }) => {
  "use server";
  // ----> Κάνει εγγραφή τον user
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
        owner: false,
        leader: false,
        mongoId: newUser._id.toString(),
      },
    });

    return true;
  } catch (error) {
    console.error("Error from root page on register action: ", error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

export const SaveQuestions = async ({ answers }) => {
  "use server";
  const { sessionClaims } = await auth();
  console.log(answers);
  console.log(sessionClaims.userId);
  try {
    await dbConnect();
    const user = await User.findOne({ clerkId: sessionClaims.userId });
    user.questions = answers;
    await user.save();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

export const SaveHours = async ({ userId, startingHour, endingHour }) => {
  "use server";
  // ----> Ενημερώνει τις trading hours του χρήστη
  try {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) return false;
    user.tradingHours.startingTradingHour = startingHour;
    user.tradingHours.endingTradingHour = endingHour;
    await user.save();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

export const SaveStatus = async ({ userId }) => {
  "use server";
  // ----> Αλλάζει τον χρήστη από ενεργό σε ανενεργό και αντίστροφα
  try {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) return false;
    if (user.status === "active") {
      user.status = "inactive";
    } else if (user.status === "inactive") {
      user.status = "active";
    }
    await user.save();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};
//#endregion

//#region Get Functions
export const GetUser = async () => {
  "use server";
  // ----> Τραβάει τον user, τα accounts του και τις εταιρίες των accounts
  try {
    await dbConnect();
    const { sessionClaims } = await auth();
    return await User.findOne({ clerkId: sessionClaims.userId }).populate({
      path: "accounts", // Populate το πεδίο "accounts"
      populate: {
        path: "company", // Nested populate το πεδίο "company" από το "accounts"
      },
    });
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const GetTrades = async (userId) => {
  "use server";
  // ----> Τραβάει τα trades που είναι pending, accepted και shown
  try {
    dbConnect();
    const trades = await Trade.find({
      $or: [
        {
          "firstParticipant.user": userId,
          "firstParticipant.status": { $in: ["pending", "accepted", "shown", "aware"] },
        },
        {
          "secondParticipant.user": userId,
          "secondParticipant.status": { $in: ["pending", "accepted", "shown", "aware"] },
        },
      ],
    })
      .populate("firstParticipant.account") // Populate firstParticipant.account
      .populate("secondParticipant.account"); // Populate secondParticipant.account
    return trades;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const GetSettings = async (userId) => {
  "use server";
  // ----> Τραβάει τα settings
  try {
    dbConnect();
    return await Settings.findOne();
  } catch (error) {
    console.log(error);
    return false;
  }
};
//#endregion

export default async function Home({ searchParams }) {
  // ---> Parameters
  const params = await searchParams;

  // ---> User και SessionClaims
  const { sessionClaims } = await auth();
  const user = await GetUser();

  //#region Έλεγχος User
  // Αν υπάρξει error τραβώντας τον user βγάλε μήνυμα λάθους
  // Αν ο user δεν υπάρχει βγάλε την φόρμα εγγραφής

  if (!user || !user?.questions || user?.questions?.length === 0) {
    return <RegisterForm RegisterUser={RegisterUser} SaveQuestions={SaveQuestions} register={Boolean(!user)} questions={Boolean(!user?.questions) || user?.questions.length === 0} />;
  }
  // Αν ο user δεν έχει γίνει ακόμα δεκτός του βγάζει μήνυμα
  if (!user.accepted) {
    return <div className="flex w-full h-dvh justify-center items-center">Επικοινώνησε με τον Αντώνη να σε κάνει approve συνάδελφε.</div>;
  }
  //#endregion

  //#region Οι ώρες που ο αλγόριθμος θα κάνει προτάσεις για τα αυριανά trades
  const now = new Date();
  let greeceTime = Number(now.toLocaleString("en-US", { timeZone: "Europe/Athens", hour: "2-digit", hour12: false }));
  const tradesSuggestionHours = {
    starting: 0,
    ending: 24,
  }; // EDIT 17 - 20
  //#endregion

  //#region Update public note για ώρα κλεισίματος
  const settings = await GetSettings();
  let publicNote = "";
  const dayOfWeek = new Date().getDay();
  switch (dayOfWeek) {
    case 1: // Δευτέρα
      publicNote = settings?.monday?.note || "Κλείνουμε στη 1:11";
      break;
    case 2: // Τρίτη
      publicNote = settings?.tuesday?.note || "Κλείνουμε στη 1:11";
      break;
    case 3: // Τετάρτη
      publicNote = settings?.wednsday?.note || "Κλείνουμε στη 1:11";
      break;
    case 4: // Πέμπτη
      publicNote = settings?.thursday?.note || "Κλείνουμε στη 1:11";
      break;
    case 5: // Παρασκευή
      publicNote = settings?.friday?.note || "Κλείνουμε στη 1:11";
      break;
    case 6: // Σάββατο
      publicNote = "Το market είναι κλειστό";
      break;
    case 0: // Κυριακή
      publicNote = "Το market είναι κλειστό";
      break;
    default:
      publicNote = "Κλείνουμε στη 1:12";
  }
  //#endregion

  //#region Διαλογή των trades
  const trades = await GetTrades(user._id.toString());

  const pendingTrades = trades.filter((trade) => {
    // Παίρνουμε τη σημερινή ημερομηνία
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Προσθέτουμε 1 μέρα για να πάρουμε την αυριανή ημερομηνία
    // Δημιουργούμε ένα `Date` object με τα στοιχεία του tradeDate
    const tradeDateObj = new Date(trade.openTime.year, trade.openTime.month - 1, trade.openTime.day); // -1 γιατί οι μήνες στο JS ξεκινούν από 0
    // Ελέγχουμε αν το tradeDate είναι η αυριανή ημέρα
    const isTomorrow = tradeDateObj.getFullYear() === tomorrow.getFullYear() && tradeDateObj.getMonth() === tomorrow.getMonth() && tradeDateObj.getDate() === tomorrow.getDate();
    if (!isTomorrow) return false;

    const isFirstParticipant = trade.firstParticipant.user.toString() === user._id.toString();
    const isSecondParticipant = trade.secondParticipant.user.toString() === user._id.toString();
    if (isFirstParticipant && trade.firstParticipant.status !== "pending") return false;
    if (isSecondParticipant && trade.secondParticipant.status !== "pending") return false;

    return true;
  });

  const acceptedTrades = trades.filter((trade) => {
    if (trade.status !== "accepted") return false;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Ορίζουμε την αυριανή ημερομηνία
    // Δημιουργούμε ένα `Date` object με τα στοιχεία του trade.openTime
    const tradeDateObj = new Date(trade.openTime.year, trade.openTime.month - 1, trade.openTime.day); // -1 γιατί οι μήνες ξεκινούν από 0
    // Ελέγχουμε αν η ημερομηνία του trade είναι είτε σήμερα είτε αύριο
    const isTodayOrTomorrow = (tradeDateObj.getFullYear() === today.getFullYear() && tradeDateObj.getMonth() === today.getMonth() && tradeDateObj.getDate() === today.getDate()) || (tradeDateObj.getFullYear() === tomorrow.getFullYear() && tradeDateObj.getMonth() === tomorrow.getMonth() && tradeDateObj.getDate() === tomorrow.getDate());
    if (!isTodayOrTomorrow) return false;

    const isFirstParticipant = trade.firstParticipant.user.toString() === user._id.toString();
    const isSecondParticipant = trade.secondParticipant.user.toString() === user._id.toString();
    if (isFirstParticipant && trade.firstParticipant.status !== "accepted") return false;
    if (isSecondParticipant && trade.secondParticipant.status !== "accepted") return false;

    return true;
  });

  const awareTrades = trades.filter((trade) => {
    const today = new Date();

    // Δημιουργούμε ένα `Date` object με τα στοιχεία του trade.openTime
    const tradeDateObj = new Date(trade.openTime.year, trade.openTime.month - 1, trade.openTime.day); // -1 γιατί οι μήνες στο JS ξεκινούν από 0

    // Ελέγχουμε αν η ημερομηνία του trade είναι **μόνο σήμερα**
    const isToday = tradeDateObj.getFullYear() === today.getFullYear() && tradeDateObj.getMonth() === today.getMonth() && tradeDateObj.getDate() === today.getDate();

    //if (!isToday) return false; EDIT
    const isFirstParticipant = trade.firstParticipant.user.toString() === user._id.toString();
    const isSecondParticipant = trade.secondParticipant.user.toString() === user._id.toString();
    if (isFirstParticipant && trade.firstParticipant.status !== "aware") return false;
    if (isSecondParticipant && trade.secondParticipant.status !== "aware") return false;
    return true;
  });

  const openTrades = trades.filter((trade) => {
    const isFirstParticipant = trade.firstParticipant.user.toString() === user._id.toString();
    const isSecondParticipant = trade.secondParticipant.user.toString() === user._id.toString();

    if (isFirstParticipant && trade.firstParticipant.status === "open") return true;
    if (isSecondParticipant && trade.secondParticipant.status === "open") return true;

    return false;
  });
  //#endregion

  //#region Διαλογή των accounts
  const waitingPurchaseAccounts = user.accounts.filter((account) => account.status === "WaitingPurchase");
  const liveAccounts = user.accounts.filter((account) => account.status === "Live");
  const needUpgradeAccounts = user.accounts.filter((account) => account.status === "NeedUpgrade");
  const waitingPayoutAccounts = user.accounts.filter((account) => account.status === "WaitingPayout");
  console.log(waitingPayoutAccounts);
  //#endregion

  return (
    <div className="flex flex-col gap-4 p-8">
      <Menu activeMenu="Profile" />

      <div className="p-4">
        <WorkingHours name={`${user.firstName} ${user.lastName}`} startingTradingHour={user.tradingHours.startingTradingHour} endingTradingHour={user.tradingHours.endingTradingHour} userStatus={user.status} ChangeHours={SaveHours} ChangeStatus={SaveStatus} userId={user._id.toString()} />
      </div>

      {publicNote && publicNote !== "" && (
        <div className="text-center p-4 bg-orange-700 w-full rounded-md text-3xl font-bold flex gap-8 flex-wrap justify-center">
          <div className="hidden md:block"> ⏰ ⏰ ⏰ </div>
          <span className="animate-bounce inline-block">{publicNote}</span>
          <div className="hidden md:block">⏰ ⏰ ⏰</div>
        </div>
      )}

      <div className="text-gray-700 flex flex-col gap-4 max-w-[800px] m-auto">
        <Link href="/instructions" className="text-center">
          📑 Οδηγίες
        </Link>
      </div>

      {greeceTime > tradesSuggestionHours.starting && greeceTime < tradesSuggestionHours.ending && <hr className="border-none h-[1px] bg-gray-800" />}
      {greeceTime > tradesSuggestionHours.starting && greeceTime < tradesSuggestionHours.ending && (
        <div className="text-center flex flex-col gap-4">
          <div>Προτάσεις Αλγορίθμου</div>
          {pendingTrades && pendingTrades.length > 0 && <PendingTrades trades={pendingTrades} user={user} />}
          {(!pendingTrades || pendingTrades.length === 0) && <div className="m-auto text-red-500 animate-pulse">Δεν υπάρχουν διαθέσιμα trades για επιλογή. Μετά τις 20:00, ώρα Ελλάδος, θα μπορείς να δεις τα trades σου για αύριο αν έχεις αποδεχτεί κάποιο σήμερα</div>}
        </div>
      )}

      {greeceTime >= 3 && greeceTime <= 19 && acceptedTrades && acceptedTrades.length > 0 && <hr className="border-none h-[1px] bg-gray-800" />}
      {greeceTime >= 3 && greeceTime <= 19 && acceptedTrades && acceptedTrades.length > 0 && (
        <div className="text-center flex flex-col gap-4">
          <div>Επιβεβαίωση Παρουσίας</div>
          <div className="text-red-500 animate-pulse">Αν το account είναι καινούριο, πριν πατήσεις το κουμπί "Είμαι εδώ" βάλε ένα trade 0.01 στο account για να σιγουρευτείς ότι στο account μπορούν να μπουν trades</div>
          <div className="text-sm text-center text-gray-700">📜 Οδηγίες: Το πρωί θα πρέπει να ξυπνήσεις νωρίτερα από το πρώτο σου trade έτσι ώστε να μπορέσεις τουλάχιστον 10 λεπτά πριν το trade να επιβεβαιώσεις ότι είσαι εδώ ώστε ο αλγόριθμος να ξέρει ότι θα το βάλεις. Αφού επιβεβαιώσεις την παρουσία σου θα βρεις το trade που πρέπει να ανοίξεις στο section "Άνοιγμα Trade".</div>
          {acceptedTrades && acceptedTrades.length > 0 && <AcceptedTrades trades={acceptedTrades} user={user} />}
          {(!acceptedTrades || acceptedTrades.length === 0) && <div className="m-auto text-red-500 animate-pulse">Δεν υπάρχουν trades για άνοιγμα</div>}
        </div>
      )}

      {(awareTrades.length > 0 || openTrades.length > 0) && <hr className="border-none h-[1px] bg-gray-800" />}
      {(awareTrades.length > 0 || openTrades.length > 0) && (
        <div className="text-center flex flex-col gap-4">
          <div>Τα Trades Σου</div>
          <div className="text-sm text-center text-gray-700">📜 Οδηγίες: Τα μωβ trades ακριβώς από κάτω είναι αυτά που αναγράφεται ότι πρέπει να μπει πατώντας το κουμπί "Άνοιγμα". Φρόντισε να το πατήσες 10 λεπτά πριν την ώρα που πρέπει να μπει για να έχεις χρόνο να τα κάνεις σωστά και να τα ελέγξεις.</div>
          {awareTrades.length > 0 && <AwareTrades trades={awareTrades} user={user} />}
        </div>
      )}

      {waitingPurchaseAccounts?.length > 0 && <hr className="border-none h-[1px] bg-gray-800" />}
      {waitingPurchaseAccounts?.length > 0 && (
        <div className="flex flex-wrap justify-center gap-8 p-4">
          {waitingPurchaseAccounts.map((account) => {
            return (
              <AccountCard
                admin={sessionClaims.metadata.owner}
                key={`account-${account._id.toString()}`}
                id={account._id.toString()}
                status={account.status}
                number={account.number || "Account: Εκκρεμεί"}
                company={account.company.name}
                balance={account.balance}
                phase={account.phase}
                note={account.note || "-"}
                link={account.company.link}
                instructions={account.company.phases[account.phase - 1].instructions}
                userId={account.user._id.toString()}
                companyId={account.company._id.toString()}
                capital={account.capital}
                isOnBoarding={account.isOnBoarding}
              />
            );
          })}
        </div>
      )}

      {needUpgradeAccounts?.length > 0 && <hr className="border-none h-[1px] bg-gray-800" />}
      {needUpgradeAccounts?.length > 0 && (
        <div className="flex flex-wrap justify-center gap-8 p-4">
          {needUpgradeAccounts.map((account) => {
            return (
              <AccountCard
                admin={sessionClaims.metadata.owner}
                key={`account-${account._id.toString()}`}
                id={account._id.toString()}
                status={account.status}
                number={account.number || "Account: Εκκρεμεί"}
                company={account.company.name}
                balance={account.balance}
                phase={account.phase}
                note={account.note || "-"}
                link={account.company.link}
                instructions={account.company.phases[account.phase - 1].instructions}
                userId={account.user._id.toString()}
                companyId={account.company._id.toString()}
                capital={account.capital}
                isOnBoarding={account.isOnBoarding}
              />
            );
          })}
        </div>
      )}

      {liveAccounts?.length > 0 && <hr className="border-none h-[1px] bg-gray-800" />}
      {liveAccounts?.length > 0 && (
        <div className="flex flex-wrap justify-center gap-8 p-4">
          {liveAccounts.map((account) => {
            return (
              <AccountCard
                admin={sessionClaims.metadata.owner}
                key={`account-${account._id.toString()}`}
                id={account._id.toString()}
                status={account.status}
                number={account.number || "Account: Εκκρεμεί"}
                company={account.company.name}
                balance={account.balance}
                phase={account.phase}
                note={account.note || "-"}
                link={account.company.link}
                instructions={account.company.phases[account.phase - 1].instructions}
                userId={account.user._id.toString()}
                companyId={account.company._id.toString()}
                capital={account.capital}
                isOnBoarding={account.isOnBoarding}
              />
            );
          })}
        </div>
      )}

      {waitingPayoutAccounts?.length > 0 && <hr className="border-none h-[1px] bg-gray-800" />}
      {waitingPayoutAccounts?.length > 0 && (
        <div className="flex flex-wrap justify-center gap-8 p-4">
          {waitingPayoutAccounts.map((account) => {
            return (
              <AccountCard
                admin={sessionClaims.metadata.owner}
                key={`account-${account._id.toString()}`}
                id={account._id.toString()}
                status={account.status}
                number={account.number || "Account: Εκκρεμεί"}
                company={account.company.name}
                balance={account.balance}
                phase={account.phase}
                note={account.note || "-"}
                link={account.company.link}
                instructions={account.company.phases[account.phase - 1].instructions}
                userId={account.user._id.toString()}
                companyId={account.company._id.toString()}
                capital={account.capital}
                isOnBoarding={account.isOnBoarding}
                thereIsDate={Boolean(account.payoutRequestDate.day)}
                payoutRequestDay={account.payoutRequestDate.day}
                payoutRequestMonth={account.payoutRequestDate.month}
                payoutRequestYear={account.payoutRequestDate.year}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// EDIT {greeceTime > 0 && greeceTime < 21 && ( το > 0 να γίνει > 16
