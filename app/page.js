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
import Link from "next/link";
import TradeButtonAcceptReject from "@/components/TradeButtonAcceptReject";

//#region Set Functions
export const RegisterUser = async ({ firstName, lastName, telephone, bybitEmail, bybitUid }) => {
  "use server";
  // ----> Κάνει εγγραφή τον user
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

export const SubmitTrade = async ({ userId, tradeId, account, action, points }) => {
  "use server";
  // ----> Απορρίπτει ή αποδέχεται το trade
  const now = new Date();
  const greeceTime = Number(now.toLocaleString("en-US", { timeZone: "Europe/Athens", hour: "2-digit", hour12: false }));
  if (greeceTime < 17 || greeceTime > 0) return false; // EDIT το > 0 να γίνει > 20
  try {
    dbConnect();
    revalidatePath("/", "layout");
    const trade = await Trade.findById(tradeId);
    if (!trade) return false;
    console.log(trade);
    console.log(trade.firstParticipant);
    console.log(trade.firstParticipant.user);
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
  }
};

export const SaveHours = async ({ userId, startingHour, endingHour }) => {
  "use server";
  // ----> Ενημερώνει τις trading hours του χρήστη
  try {
    await dbConnect();
    revalidatePath("/", "layout");
    const user = await User.findById(userId);
    if (!user) return false;
    user.tradingHours.startingTradingHour = startingHour;
    user.tradingHours.endingTradingHour = endingHour;
    await user.save();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const SaveStatus = async ({ userId }) => {
  "use server";
  // ----> Αλλάζει τον χρήστη από ενεργό σε ανενεργό και αντίστροφα
  try {
    await dbConnect();
    revalidatePath("/", "layout");
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
          "firstParticipant.status": { $in: ["pending", "accepted", "shown"] },
        },
        {
          "secondParticipant.user": userId,
          "secondParticipant.status": { $in: ["pending", "accepted", "shown"] },
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

export default async function Home() {
  const { sessionClaims } = await auth();
  const user = await GetUser();

  const now = new Date();
  const greeceTime = Number(now.toLocaleString("en-US", { timeZone: "Europe/Athens", hour: "2-digit", hour12: false }));

  //#region Έλεγχος User Permissions
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
  // Αν ο χρήστης δεν είναι ο ιδιοκτήτης του profile ή δεν είναι ο owner της σελίδας του επιστρέφει μήνυμα
  if (!sessionClaims.metadata.owner && sessionClaims.metadata.mongoId !== user._id.toString()) {
    return <div className="flex w-full h-dvh justify-center items-center">Δεν έχεις permissions να δεις αυτό το profile</div>;
  }
  //#endregion

  const settings = await GetSettings();
  const trades = await GetTrades(user._id.toString());

  //#region Update public note για ώρα κλεισίματος
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

  return (
    <div className="flex flex-col gap-4 p-8">
      <Menu activeMenu="Profile" />
      <div className="m-auto text-2xl">
        {user.firstName} {user.lastName}
      </div>
      <WorkingHours startingTradingHour={user.tradingHours.startingTradingHour} endingTradingHour={user.tradingHours.endingTradingHour} userStatus={user.status} ChangeHours={SaveHours} ChangeStatus={SaveStatus} userId={user._id.toString()} />
      {publicNote && publicNote !== "" && (
        <div className="text-center p-4 bg-orange-700 w-full rounded-md text-3xl font-bold">
          ⏰ ⏰ ⏰ <span className="animate-bounce inline-block">{publicNote}</span> ⏰ ⏰ ⏰
        </div>
      )}
      <div className="flex flex-col gap-8">
        <div className="text-center">
          {greeceTime > 0 && greeceTime < 21 && (
            <>
              <div className="text-sm text-gray-700">
                📜 Οδηγίες: Κάθε απόγευμα 17:00 - 20:00 ώρα Ελλάδος, ακριβώς κάτω από εδώ, θα υπάρχουν προτάσεις από τον αλγόριθμο για τα trades που μπορείτε να βάλετε την επόμενη μέρα. Εσείς μπορείτε να πατάνε Accept ή Reject αναλόγως αν μπορείτε εκείνη την ώρα να το βάλετε. Οι προτάσεις είναι είτε σε πορτοκαλί είτε σε γκρι πλαίσιο. Τα πορτοκαλί είναι εντός των ωρών που εσείς έχετε δηλώσει ότι μπορείτε. Οπότε αν τα κάνετε Reject χάνετε τα EP που αναγράφονται στην παρένθεση λόγω ασυνέπειας. Τα
                γκρι από την άλλη είναι σε ώρες που έχετε δηλώσει ότι δεν μπορείτε. Οπότε αν τα κάνετε Accept κερδίζετε EP.
              </div>
              <div className="flex gap-8 flex-wrap my-4 m-auto">
                {trades.map((trade) => {
                  let account;
                  let status;
                  let priority;
                  const day = trade.openTime.dayString;
                  const date = trade.openTime.day + "/" + trade.openTime.month;
                  const hour = trade.openTime.hour + ":" + (trade.openTime.minutes < 10 ? `0${trade.openTime.minutes}` : trade.openTime.minutes);

                  if (trade.firstParticipant.user._id.toString() === user._id.toString()) {
                    account = trade.firstParticipant.account.number;
                    status = trade.firstParticipant.status;
                    priority = trade.firstParticipant.priority;
                  }
                  if (trade.secondParticipant.user._id.toString() === user._id.toString()) {
                    account = trade.secondParticipant.account.number;
                    status = trade.secondParticipant.status;
                    priority = trade.secondParticipant.priority;
                  }

                  if (status !== "pending") return;

                  return (
                    <div key={`trade-${trade._id.toString()}`} className={`flex m-auto flex-col justify-center items-center rounded gap-6 px-4 py-4 ${priority === "high" ? "border-2 border-orange-500" : " border border-gray-700"}`}>
                      <div className="text-center p-2 rounded flex gap-2 text-2xl font-bold">
                        <div>{date}</div>
                        <div>{day}</div>
                        <div>{hour}</div>
                      </div>
                      <div className="flex gap-4 w-full">
                        <TradeButtonAcceptReject text="Accept" account={account} accept={true} reject={false} trader={user._id.toString()} trade={trade._id.toString()} SubmitTrade={SubmitTrade} acceptPoints={priority === "high" ? 0 : 2} rejectPoints={priority === "high" ? -2 : 0} />
                        <div className="text-sm flex items-center">{account}</div>
                        <TradeButtonAcceptReject text="Reject" account={account} accept={false} reject={true} trader={user._id.toString()} trade={trade._id.toString()} SubmitTrade={SubmitTrade} acceptPoints={priority === "high" ? 0 : 2} rejectPoints={priority === "high" ? -2 : 0} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <div>context</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {user.accounts &&
          user.accounts.length > 0 &&
          user.accounts.map((account) => {
            return (
              <AccountCard key={`account-${account._id.toString()}`} id={account._id.toString()} status={account.status} number={account.number || "-"} company={account.company.name} balance={account.balance} phase={account.phase} note={account.note || "-"} link={account.company.link} instructions={account.company.phases[account.phase - 1].instructions} userId={account.user._id.toString()} companyId={account.company._id.toString()} capital={account.capital} isOnBoarding={account.isOnBoarding} />
            );
          })}
      </div>
    </div>
  );
}

// EDIT {greeceTime > 0 && greeceTime < 21 && ( το > 0 να γίνει > 16
