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
import Link from "next/link";
import TradeButtonAcceptReject from "@/components/TradeButtonAcceptReject";
import { keyframes } from "framer-motion";

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

export const SaveHours = async ({ userId, startingHour, endingHour }) => {
  "use server";
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

export const GetTrades = async (userId) => {
  "use server";
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

export const AcceptTrade = async ({ userId, tradeId, action }) => {
  "use server";
  try {
    dbConnect();
    const trade = await Trade.find(tradeId);
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
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default async function Home() {
  const { sessionClaims } = await auth();

  const user = await GetUser();
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

  const trades = await GetTrades(user._id.toString());

  return (
    <div className="flex flex-col gap-4 p-8">
      <Menu activeMenu="Profile" />
      <div className="m-auto text-2xl">
        {user.firstName} {user.lastName}
      </div>
      <WorkingHours startingTradingHour={user.tradingHours.startingTradingHour} endingTradingHour={user.tradingHours.endingTradingHour} userStatus={user.status} ChangeHours={SaveHours} ChangeStatus={SaveStatus} userId={user._id.toString()} />
      {publicNote && publicNote !== "" && <div className="text-center p-4 bg-orange-700 w-full rounded-md text-lg font-bold">{publicNote}</div>}
      <div className="flex gap-8 flex-wrap my-4 m-auto">
        {trades.map((trade) => {
          let account;
          let status;
          let priority;
          const day = trade.openTime.dayString;
          const date = trade.openTime.day + "/" + trade.openTime.month + "/" + trade.openTime.year;
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

          if (status === "pending") {
            return (
              <div key={`trade-${trade._id.toString()}`} className={`flex flex-col items-center rounded gap-2 px-4 py-4 ${priority === "high" ? "border border-orange-500" : " border border-gray-700"}`}>
                <TradeButtonAcceptReject accept={true} reject={false} trader={user._id.toString()} trade={trade._id.toString()} />
                <div>{account}</div>
                <div className="text-sm">{status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}</div>
                <div className="text-center border border-gray-500 p-2 rounded flex flex-col gap-2 text-sm">
                  <div>{day}</div>
                  <div>{date}</div>
                  <div>{hour}</div>
                </div>
                <TradeButtonAcceptReject accept={false} reject={true} trader={user._id.toString()} trade={trade._id.toString()} />
              </div>
            );
          }
        })}
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
