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

export const SubmitTrade = async ({ userId, tradeId, account, action, points }) => {
  "use server";
  // ----> Απορρίπτει ή αποδέχεται το trade
  const tradesSuggestionHours = {
    starting: 0,
    ending: 24,
  }; // EDIT
  const now = new Date();
  const greeceTime = Number(now.toLocaleString("en-US", { timeZone: "Europe/Athens", hour: "2-digit", hour12: false }));
  if (greeceTime < tradesSuggestionHours.starting || greeceTime > tradesSuggestionHours.ending) return false; // EDIT το > 0 να γίνει > 20

  try {
    await dbConnect();
    const trade = await Trade.findById(tradeId);
    if (!trade) return false;

    if (trade.firstParticipant.user._id.toString() === userId) {
      if (action === "accept") {
        trade.firstParticipant.status = "accepted";
      } else if (action === "reject") {
        trade.firstParticipant.status = "canceled";
      }
    }
    if (trade.secondParticipant.user._id.toString() === userId) {
      if (action === "accept") {
        trade.secondParticipant.status = "accepted";
      } else if (action === "reject") {
        trade.secondParticipant.status = "canceled";
      }
    }
    await trade.save();

    if (points < 0) {
      const user = await User.findById(userId);
      const title = "Trade Rejected";
      const description = `Ο/Η ${user.firstName} ${user.lastName} έχασε ${Math.abs(points)} points επειδή έκανε reject ένα high priority trade στο ${account}`;
      await user.addPoints({ title, description, points });
    }
    if (points > 0) {
      const user = await User.findById(userId);
      const title = "Trade Accepted";
      const description = `Ο/Η ${user.firstName} ${user.lastName} κέρδισε ${Math.abs(points)} points επειδή έκανε accept ένα low priority trade στο ${account}`;
      await user.addPoints({ title, description, points });
    }

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
  const instructions = params?.instructions;

  // ---> User και SessionClaims
  const { sessionClaims } = await auth();
  const user = await GetUser();
  console.log("USERRRRRRRRRRRRR", user._id.toString());
  //#region Έλεγχος User
  // Αν υπάρξει error τραβώντας τον user βγάλε μήνυμα λάθους
  // Αν ο user δεν υπάρχει βγάλε την φόρμα εγγραφής
  if (!user) {
    return <RegisterForm RegisterUser={RegisterUser} />;
  }
  // Αν ο user δεν έχει γίνει ακόμα δεκτός του βγάζει μήνυμα
  if (!user.accepted) {
    return <div className="flex w-full h-dvh justify-center items-center">Επικοινώνησε με τον Αντώνη να σε κάνει approve συνάδελφε.</div>;
  }
  //#endregion

  // ----> Οι ώρες που ο αλγόριθμος θα κάνει προτάσεις για τα αυριανά trades
  const now = new Date();
  const greeceTime = Number(now.toLocaleString("en-US", { timeZone: "Europe/Athens", hour: "2-digit", hour12: false }));
  const tradesSuggestionHours = {
    starting: 0,
    ending: 24,
  }; // EDIT 17 - 20

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
  console.log(trades.length);
  const awareTrades = trades.filter((trade) => {
    console.log("dsfsdafasdfafasd");
    if (trade.status !== "accepted") return false;
    const today = new Date();

    // Δημιουργούμε ένα `Date` object με τα στοιχεία του trade.openTime
    const tradeDateObj = new Date(trade.openTime.year, trade.openTime.month - 1, trade.openTime.day); // -1 γιατί οι μήνες στο JS ξεκινούν από 0

    // Ελέγχουμε αν η ημερομηνία του trade είναι **μόνο σήμερα**
    const isToday = tradeDateObj.getFullYear() === today.getFullYear() && tradeDateObj.getMonth() === today.getMonth() && tradeDateObj.getDate() === today.getDate();

    //if (!isToday) return false;
    //console.log(trade);
    console.log("USER", user._id.toString());
    console.log("FP", trade.firstParticipant.user.toString());
    console.log("SP", trade.secondParticipant.user.toString());
    const isFirstParticipant = trade.firstParticipant.user.toString() === user._id.toString();
    const isSecondParticipant = trade.secondParticipant.user.toString() === user._id.toString();
    console.log("aaaaaaaaaaa");
    console.log(isFirstParticipant);
    console.log(isSecondParticipant);
    if (isFirstParticipant && trade.firstParticipant.status !== "aware") return false;
    if (isSecondParticipant && trade.secondParticipant.status !== "aware") return false;
    console.log("bbbbbbbbbbb");
    return true;
  });

  //console.log(awareTrades);

  const shownTrades = trades.filter((trade) => {
    const isFirstParticipant = trade.firstParticipant.user.toString() === user._id.toString();
    const isSecondParticipant = trade.secondParticipant.user.toString() === user._id.toString();

    if ((isFirstParticipant && trade.firstParticipant.status === "shown") || (isSecondParticipant && trade.secondParticipant.status === "shown")) {
      return true;
    }

    return false;
  });
  //#endregion

  return (
    <div className="flex flex-col gap-4 p-8">
      <Menu activeMenu="Profile" />

      <div className="m-auto text-2xl">
        {user.firstName} {user.lastName}
      </div>

      <WorkingHours startingTradingHour={user.tradingHours.startingTradingHour} endingTradingHour={user.tradingHours.endingTradingHour} userStatus={user.status} ChangeHours={SaveHours} ChangeStatus={SaveStatus} userId={user._id.toString()} />

      {publicNote && publicNote !== "" && (
        <div className="text-center p-4 bg-orange-700 w-full rounded-md text-3xl font-bold flex gap-8 flex-wrap justify-center">
          <div className="hidden md:block"> ⏰ ⏰ ⏰ </div>
          <span className="animate-bounce inline-block">{publicNote}</span>
          <div className="hidden md:block">⏰ ⏰ ⏰</div>
        </div>
      )}

      <div className="text-gray-700 flex flex-col gap-4 max-w-[800px] m-auto">
        <Link href={instructions !== "true" ? "/?instructions=true" : "/"} className="text-center">
          📑 Οδηγίες
        </Link>
        {instructions && instructions === "true" && (
          <div className="flex flex-col gap-4 items-center justify-center flex-wrap">
            <div className="border border-gray-700 px-4 py-1 w-full">1. Βάζεις τα προγραμματισμένα trades σου οπωσδήποτε την ώρα που πρέπει</div>
            <div className="text-justify w-full">
              Το πρωί που θα ξυπνήσεις θα δεις το section "Επιβεβαίωση Παρουσίας". Εκεί θα πρέπει τουλάχιστον 10 λεπτά πριν το trade (αλλά όχι σε διάστημα μεγαλύτερο της μίας ώρας) να επιβεβαιώσεις ότι είσαι εδώ πατώντας το κουμπί "Είμαι εδώ". Δηλαδή αν το trade σου πρέπει να ανοίξει 7:42 θα πρέπει 6:42 με 7:32 να επιβεβαιώσεις ότι είσαι εδώ. Στην συνέχεια στο section "Άνοιγμα Trade" θα δεις το trade που πρέπει να ανοίξεις. Πάτα το "Άνοιγμα Trade" 10 λεπτά νωρίτερα (δηλαδή 7:32 με 7:34) ώστε να
              έχεις τον χρόνο να το φτιάξεις και να το ελέγξεις. Πάτησε το κουμπί για να ανοίξει το trade στο MetaTrader ή το MatchTrader ακριβώς την ώρα που πρέπει (δηλαδή 7:42 στο παράδειγμά μας). Ούτε ένα λεπτό πάνω ούτε ένα λεπτό κάτω, και αυτό είναι σημαντικό. Το account θα πρέπει να είναι από την προηγούμενη μέρα τεσταρισμένο ότι παίρνει trades. Δηλαδή θα πρέπει να έχεις βάλει 0.01 ώστε να είσαι σίγουρος ότι μπορούν να μπουν trades για να μην ψάχνεις κατόπιν εορτής πώς θα διορθωθεί το
              λάθος γιατί εκείνη την ώρα δεν θα βρεις κανέναν να σε βοηθήσει.
            </div>
            <div className="border border-gray-700 px-4 py-1 w-full">2. Κλείνεις όλα τα trades σου οπωσδήποτε την ώρα που πρέπει</div>
            <div className="text-justify w-full">Ακριβώς από πάνω, στο κόκκινο πλαίσιο, γράφει κάθε μέρα τι ώρα πρέπει να κλείνουμε τα trades. Πρέπει να τα κλείνουμε σε αυτό το διάστημα που γράφει το πλαίσιο. Ούτε πιο νωρίς επειδή δεν θα μπορούμε αργότερα ούτε πιο μετά γιατί "κάναμε κάτι σημαντικό εκείνη την ώρα". Οι δικαιολογίες δεν ενδιαφέρουν κανέναν και κανένας δεν θα μας φέρει πίσω τα λεφτά του καμμένου account επειδή είχαμε καλή δικαιολογία. Είμαστε υπεύθυνοι!</div>
            <div className="border border-gray-700 px-4 py-1 w-full">3. Πριν τις 4:30 το απόγευμα πρέπει να έχεις ενημερώσει το balance σου στην σελίδα</div>
            <div className="text-justify w-full">Κάθε μέρα είναι υποχρεωτικό και απολύτως απαραίτητο να έχουμε ενημερώσει το balance όλων μας των account πριν τις 4:30 το απόγευμα αλλίως ο αλγόριθμος δεν θα μας συμπεριλάβει στα trades της επόμενης ημέρας. Που σημαίνει είμαστε ανεύθυνοι. Και η ανευθυνότητα δεν έχει θέση όταν κρατάμε accounts μεγάλης αξίας.</div>
            <div className="border border-gray-700 px-4 py-1 w-full">4. 5:00 με 8:00 το βράδυ κάνεις accept/reject τα προτεινόμενα trades για την επόμενη μέρα</div>
            <div className="text-justify w-full">
              Κάθε μέρα από τις 5:00 το απόγευμα μέχρι τις 8:00 το βράδυ βλέπεις τα trades που σου έχει προτείνει ο αλγόριθμος και πατάς accept σε αυτά που μπορείς να βάλεις και reject σε αυτά που δεν μπορείς. Αν πατήσεις accept σε ένα γκρίζο trade που είναι εκτός των ωρών που έχεις δηλώσει ότι σε βολεύεουν τότε θα πάρεις EP, αν πατήσεις reject δεν θα χάσεις τίποτα. Αντίθετα, αν πατήσεις accept σε ένα μπλε trade που είναι στις ώρες που σε βολεύουν δεν θα πάρεις EP, αλλά αν πατήσεις reject θα
              χάσεις. Εννοείται ότι αν δεν κάνεις τίποτα από τα δύο ο αλγόριθμος θα το εκλάβει σαν την απόλυτη ανευθυνότητα.
            </div>
            <div className="border border-gray-700 px-4 py-1 w-full">5. Μετά τις 8:00 το βράδυ μπορείς να δεις τα trades που πρέπει να βάλεις την επόμενη μέρα</div>
            <div className="text-justify w-full">Μετά τις 8:00 το βράδυ μπορείς να μπεις και να δεις το αυριανό σου πρόγραμμα ώστε να σετάρεις τα ξυπνητήρια σου και λοιπά.</div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-8">
        {greeceTime > tradesSuggestionHours.starting && greeceTime < tradesSuggestionHours.ending && (
          <div className="text-center flex flex-col gap-4">
            <hr className="border-none h-[1px] bg-gray-800" />
            <div>Προτάσεις Αλγορίθμου</div>
            <div className="text-sm text-center text-gray-700">
              📜 Οδηγίες: Κάθε απόγευμα 17:00 - 20:00 ώρα Ελλάδος, ακριβώς κάτω από εδώ, θα υπάρχουν προτάσεις από τον αλγόριθμο για τα trades που μπορείς να βάλεις την επόμενη μέρα. Εσύ μπορείς να πατάς Accept ή Reject αναλόγως αν μπορείς εκείνη την ώρα να το βάλεις. Οι προτάσεις είναι είτε με μπλε είτε με γκρι. Τα μπλε είναι εντός των ωρών που εσύ έχεις δηλώσει ότι μπορείς. Οπότε αν τα κάνεις Reject χάνεις τα EP που αναγράφονται στην παρένθεση λόγω ασυνέπειας. Τα γκρι από την άλλη είναι σε
              ώρες που έχεις δηλώσει ότι δεν μπορείς. Οπότε αν τα κάνεις Accept κερδίζεις τα EP που αναγράφονται στην παρένθεση.
            </div>
            {pendingTrades && pendingTrades.length > 0 && <PendingTrades trades={pendingTrades} user={user} SubmitTrade={SubmitTrade} />}
            {(!pendingTrades || pendingTrades.length === 0) && <div className="m-auto text-red-500 animate-pulse">Δεν υπάρχουν διαθέσιμα trades για επιλογή. Μετά τις 20:00, ώρα Ελλάδος, θα μπορείς να δεις τα trades σου για αύριο αν έχεις αποδεχτεί κάποιο σήμερα</div>}
          </div>
        )}

        {greeceTime >= 3 && greeceTime <= 19 && acceptedTrades && acceptedTrades.length > 0 && (
          <div className="text-center flex flex-col gap-4">
            <hr className="border-none h-[1px] bg-gray-800" />
            <div>Επιβεβαίωση Παρουσίας</div>
            <div className="text-red-500 animate-pulse">Αν το account είναι καινούριο, πριν πατήσεις το κουμπί "Είμαι εδώ" βάλε ένα trade 0.01 στο account για να σιγουρευτείς ότι στο account μπορούν να μπουν trades</div>
            <div className="text-sm text-center text-gray-700">📜 Οδηγίες: Το πρωί θα πρέπει να ξυπνήσεις νωρίτερα από το πρώτο σου trade έτσι ώστε να μπορέσεις τουλάχιστον 10 λεπτά πριν το trade να επιβεβαιώσεις ότι είσαι εδώ ώστε ο αλγόριθμος να ξέρει ότι θα το βάλεις. Αφού επιβεβαιώσεις την παρουσία σου θα βρεις το trade που πρέπει να ανοίξεις στο section "Άνοιγμα Trade".</div>
            {acceptedTrades && acceptedTrades.length > 0 && <AcceptedTrades trades={acceptedTrades} user={user} SubmitTrade={SubmitTrade} />}
            {(!acceptedTrades || acceptedTrades.length === 0) && <div className="m-auto text-red-500 animate-pulse">Δεν υπάρχουν trades για άνοιγμα</div>}
          </div>
        )}

        {greeceTime >= 3 && greeceTime <= 19 && awareTrades && awareTrades.length > 0 && (
          <div className="text-center flex flex-col gap-4">
            <hr className="border-none h-[1px] bg-gray-800" />
            <div>Επιβεβαίωση Παρουσίας</div>
            <div className="text-red-500 animate-pulse">Αν το account είναι καινούριο, πριν πατήσεις το κουμπί "Είμαι εδώ" βάλε ένα trade 0.01 στο account για να σιγουρευτείς ότι στο account μπορούν να μπουν trades</div>
            <div className="text-sm text-center text-gray-700">📜 Οδηγίες: Το πρωί θα πρέπει να ξυπνήσεις νωρίτερα από το πρώτο σου trade έτσι ώστε να μπορέσεις τουλάχιστον 10 λεπτά πριν το trade να επιβεβαιώσεις ότι είσαι εδώ ώστε ο αλγόριθμος να ξέρει ότι θα το βάλεις. Αφού επιβεβαιώσεις την παρουσία σου θα βρεις το trade που πρέπει να ανοίξεις στο section "Άνοιγμα Trade".</div>
            {acceptedTrades && acceptedTrades.length > 0 && <AcceptedTrades trades={acceptedTrades} user={user} SubmitTrade={SubmitTrade} />}
            {(!acceptedTrades || acceptedTrades.length === 0) && <div className="m-auto text-red-500 animate-pulse">Δεν υπάρχουν trades για άνοιγμα</div>}
          </div>
        )}

        <div className="flex justify-center gap-8">
          {user.accounts &&
            user.accounts.length > 0 &&
            user.accounts.map((account) => {
              return (
                <AccountCard
                  key={`account-${account._id.toString()}`}
                  id={account._id.toString()}
                  status={account.status}
                  number={account.number || "-"}
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
      </div>
    </div>
  );
}

// EDIT {greeceTime > 0 && greeceTime < 21 && ( το > 0 να γίνει > 16
