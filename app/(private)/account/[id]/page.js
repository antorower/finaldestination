export const dynamic = "force-dynamic";

import Account from "@/models/Account";
import dbConnect from "@/dbConnect";
import PageTransition from "@/components/PageTransition";
import SaveAccountNumberForm from "./SaveAccountNumberForm";
import { revalidatePath } from "next/cache";
import ChangeStatus from "./ChangeStatus";
import InfoButton from "@/components/InfoButton";
import OpenTicketForm from "@/components/Ticket/OpenTicketForm";
import AccountTickets from "./AccountTickets";
import { AddActivity } from "@/library/AddActivity";
import UpgradeAccountForm from "./UpgradeAccountForm";
import PendingPayoutForm from "./PendingPayoutForm";
import PayoutRequestDoneButton from "./PayoutRequestDoneButton";
import PayoutForm from "./PayoutForm";
import Payout from "@/models/Payout";
import { auth } from "@clerk/nextjs/server";
import DeleteAccount from "./DeleteAccount";

const GetAccount = async (id) => {
  "use server";
  await dbConnect();
  try {
    return Account.findById(id)
      .populate("company")
      .populate("lastTrade")
      .populate({
        path: "user",
        populate: {
          path: "leader", // Κάνουμε populate και τον leader του χρήστη
          model: "User",
        },
      });
  } catch (error) {
    console.log("Υπήρξε error στην GetAccount στο /account/[id]", error);
    return false;
  }
};

const SaveNewAccountNumber = async ({ accountId, newNumber, login, password, server }) => {
  "use server";
  if (!accountId || !newNumber) return { error: true, message: "Συμπλήρωσε το account number" };
  try {
    await dbConnect();
    const account = await Account.findById(accountId);
    account.number = newNumber;
    account.status = "Live";
    account.isOnBoarding = true;
    account.note = "Χρειάζεται Ενεργοποίηση";
    account.login = login;
    account.password = password;
    account.server = server;

    await account.save();
    await AddActivity({ title: "Έγινε Αγορά Νέου Account", description: "Έγινε αγορά account από τον χρήστη", user: account.user, account: account._id });
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην SaveNewAccountNumber στο /account/[id]", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const ChangeAccountStatus = async ({ id, status }) => {
  "use server";
  try {
    await dbConnect();

    // Εκτέλεση του updateOne για αλλαγή του isOnBoarding
    const note = status ? "Χρειάζεται Ενεργοποίηση" : "";
    const result = await Account.updateOne({ _id: id }, { $set: { isOnBoarding: status, note: note } });

    if (result.modifiedCount === 0) {
      return { error: true, message: "Δεν έγινε καμία αλλαγή" };
    }

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error κατά την ChangeAccountStatus στο /account/[id]", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const UpgradeAccount = async ({ accountId, newNumber, login, password, server }) => {
  "use server";
  try {
    await dbConnect();
    const account = await Account.findById(accountId).populate("user");
    if (!account) return { error: true, message: "Το account δεν βρέθηκε" };
    account.upgradedDate = new Date();
    account.status = "Upgrade Done";
    await account.save();

    // Αλλαγές User
    await account.user.removeAccount(account._id.toString());
    if (account.phase === 2) {
      account.user.allAccounts.phase2 += 1;
      await account.user.save();
    } else if (account.phase === 3) {
      account.user.allAccounts.phase3 += 1;
      await account.user.save();
    }

    const newAccount = new Account({
      user: account.user,
      company: account.company,
      number: newNumber,
      capital: account.capital,
      phase: account.phase + 1,
      balance: account.capital,
      status: "Live",
      isOnBoarding: true,
      needBalanceUpdate: false,
      adminCaseOn: false,
      adminNote: "",
      login: login,
      password: password,
      server: server,
    });
    if (account.offer) newAccount.offer = account.offer;
    await newAccount.save();
    await account.user.addAccount(newAccount._id.toString());
    return { error: false };
  } catch (error) {
    console.log(error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const SavePayoutDate = async ({ accountId, date }) => {
  "use server";
  try {
    await dbConnect();

    const account = await Account.findById(accountId);
    if (!account) {
      return { error: true, message: "Ο λογαριασμός δεν βρέθηκε." };
    }

    // Αποθήκευση της ημερομηνίας
    account.payoutRequestDate = date;

    // Μετατροπή της ημερομηνίας σε "DD/MM/YYYY"
    const formattedDate = new Intl.DateTimeFormat("el-GR", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).format(new Date(date));

    // Αποθήκευση του note με την ημερομηνία
    //account.note = `Payout: ${formattedDate}`;

    await account.save();

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην SavePayoutDate στο /admin/account/[id]", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const PayoutRequestDone = async (accountId) => {
  "use server";
  try {
    await dbConnect();

    const account = await Account.findById(accountId);
    if (!account) {
      return { error: true, message: "Ο λογαριασμός δεν βρέθηκε." };
    }

    //account.note = "Είσπραξη Payout";
    account.status = "Payout Request Done";

    await account.save();

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην PayoutRequestDone στο /admin/account/[id]", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const SendPayout = async ({ accountId, payoutAmount, userShare, leaderDept, teamDept, userReport }) => {
  "use server";
  try {
    await dbConnect();
    const account = await Account.findById(accountId).populate({
      path: "user",
      populate: {
        path: "leader", // Εδώ κάνουμε populate το leader που είναι μέσα στο user
        model: "User",
      },
    });

    const newPayout = new Payout({
      user: account.user._id,
      leader: account.user.leader._id,
      account: account._id,
      payoutAmount: payoutAmount,
      userShare: userShare,
      leaderDept: leaderDept,
      teamDept: teamDept,
      report: userReport,
      status: "Open",
    });
    await newPayout.save();

    account.user.profits += teamDept;
    account.user.dept -= leaderDept;
    await account.user.save();

    account.user.leader.profits += leaderDept;
    account.user.leader.save();

    account.status = "Money Sended";
    account.note = null;
    await account.save();

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην SendPayout στο /admin/account/[id]", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const DeleteAccountAction = async ({ accountId }) => {
  "use server";
  try {
    await dbConnect();
    const account = await Account.findById(accountId).populate("user");
    if (!account) return { error: true, message: "Το account δεν βρέθηκε" };
    account.status = "Lost";
    account.lostDate = new Date();
    account.user.accounts = account.user.accounts.filter((accId) => accId.toString() !== accountId);
    await account.user.save();
    await account.save();
    return { error: false, message: "Το account διεγράφη" };
  } catch (error) {
    console.log("Υπήρξε error στην DeleteAccountAction στο /admin/account/[id]", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const AccountPage = async ({ params }) => {
  const { sessionClaims } = await auth();
  const isOwner = sessionClaims.metadata.isOwner;

  const { id } = await params;

  const account = await GetAccount(id);

  const phases = ["phase1", "phase2", "phase3"];

  return (
    <PageTransition>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className={`${account.isOnBoarding ? "bg-red-500" : "bg-blue-500"} p-4 rounded text-white font-bold text-xl flex justify-center items-center gap-4 transition-colors duration-300`}>
            <div>
              <ChangeStatus ChangeAccountStatus={ChangeAccountStatus} id={account._id.toString()} status={account.isOnBoarding} />
            </div>
            <div>{account.number || "Account Number: Εκκρεμεί"}</div>
            <InfoButton classes="text-base" message="Αν το account δεν πρέπει να παίξει και άρα δεν πρέπει ο αλγόριθμος να το συμπεριλάβει στον σχεδιασμό, πάτησε το στρογγυλό κουμπί για να το απενεργοποιήσεις. Πριν το ενεργοποιήσεις βάλε 0.01 για να σιγουρευτείς ότι είναι έτοιμο να δεχτεί trade." />
          </div>
          <div className="text-center bg-gray-100 rounded p-4 text-gray-700 flex justify-between">
            <div>
              {account.user.firstName} {account.user.lastName}
            </div>
            <div>{account.company.name}</div>
            {isOwner && <DeleteAccount accountId={account._id.toString()} DeleteAccountAction={DeleteAccountAction} />}
          </div>
        </div>
        <div className="max-w-[500px] m-auto">
          <div className="text-gray-700 font-semibold text-center w-full">Γενικές Οδηγίες Εταιρίας</div>
          <div className="text-gray-500 text-center w-full">{account.company[phases[account.phase - 1]].instructions}</div>
        </div>
        <div>
          {account.status === "Pending Purchase" && (
            <div>
              <div className="text-center text-gray-600">
                {`Αγόρασε ένα account των ${
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
                    .format(account.capital)
                    .replace(",", ".") // Αντικαθιστούμε το κόμμα με τελεία
                } από την ${account.company.name} και πέρασε τον αριθμό του account στο input ακριβώς από κάτω.`}
              </div>

              <div className="flex justify-center mt-4">
                <SaveAccountNumberForm SaveNewAccountNumber={SaveNewAccountNumber} accountId={account._id.toString()} />
              </div>
            </div>
          )}
          {account.status === "Live" && (
            <div>
              {account.isOnBoarding && (
                <div>
                  <div className="text-center text-red-500 font-bold mb-4 text-2xl">Το account σου δεν είναι ενεργό</div>
                  <div className="text-gray-700 px-4 max-w-[600px] text-justify m-auto">
                    <span className="font-black animate-pulse text-red-700">Πάρα πολύ σημαντική σημείωση:</span> Πριν ενεργοποιήσεις το account βάλε 0.01 για να σιγουρευτείς ότι μπορεί να πάρει trade. Αν ο αλγόριθμος σου δώσει trade και εκ των υστέρων καταλάβεις ότι δεν μπορείς να το βάλεις τότε θα σου χρεώσει αυτόματα το λάθος.
                  </div>
                </div>
              )}
              {!account.isOnBoarding && <div className="text-center text-gray-600 text-xl">Το account σου είναι ενεργό</div>}
            </div>
          )}
          {account.status === "Pending Upgrade" && (
            <div>
              <div className="text-center text-gray-600 font-bold mb-2 text-lg">Κάνε Upgrade το Account</div>
              <UpgradeAccountForm UpgradeAccount={UpgradeAccount} account={account._id.toString()} />
            </div>
          )}
          {account.status === "Upgrade Done" && <div className="text-center">Το account έχει γίνει upgrade</div>}
          {(account.status === "Lost" || account.status === "Review") && <div className="text-center">Το account έχει χάσει</div>}
          {account.status === "Pending Payout" && (
            <div>
              <PendingPayoutForm SavePayoutDate={SavePayoutDate} accountId={account._id.toString()} date={account.payoutRequestDate} />
              <div className="flex flex-col gap-2 justify-center m-auto max-w-[500px] bg-gray-50 p-4 border border-gray-300 rounded-lg mt-4">
                <div className="mt-4 text-justify">Μόλις κάνεις το Payout Request πάτησε το κουμπί παρακάτω για να ενημερωθεί η σελίδα και οι διαχειριστές ότι το payout request έχει γίνει.</div>
                <div className="text-center">
                  <PayoutRequestDoneButton PayoutRequestDone={PayoutRequestDone} accountId={account._id.toString()} />
                </div>
              </div>
            </div>
          )}
          {account.status === "Payout Request Done" && (
            <div>
              <div className="font-bold text-center border-b border-gray-700 p-2">ΑΦΟΥ ΜΠΕΙ ΤΟ PAYOUT ΣΤΟΝ ΛΟΓΑΡΙΑΣΜΟ ΣΟΥ ΚΑΝΕ ΤΑ ΠΑΡΑΚΑΤΩ</div>
              <div className="m-auto p-4 w-full max-w-[500px] text-justify text-gray-500">Αφού μπει το payout στον λογαριασμό σου ΔΕΣ ΑΠΟ ΤΟ WALLET ΣΟΥ πόσα χρήματα μπήκαν. Δηλαδή μην μαντέψεις ούτε να βάλεις το ποσό που είπε η εταιρεία ότι θα σου βάλει πριν το payout. ΔΕΣ πόσα πραγματικά μπήκαν στο wallet σου και συμπλήρωσε την παρακάτω φόρμα. Πάτησε Υπολογισμός. Θα βγει ένα report για εσένα. Κράτησε τα χρήματα που σου λέει το report και στείλε τα υπόλοιπα.</div>
              <PayoutForm accountId={account._id.toString()} accountProfits={account.balance - account.capital} SendPayout={SendPayout} userProfits={account.user.profits} userDept={account.user.dept} userSharePercent={account.user.share} />
            </div>
          )}
          {account.status === "Money Sended" && <div>Money Sended</div>}
        </div>
        {false && (
          <div className="grid grid-cols-12 p-4 max-w-[800px] m-auto w-full gap-4 h-[340px]">
            <div className="col-span-12 xl:col-span-6 border border-gray-300 rounded p-4 overflow-y-auto">
              <AccountTickets accountId={id} />
            </div>
            <div className="col-span-12 xl:col-span-6 lg:grid-cols-6">
              <OpenTicketForm user={account.user._id.toString()} sender={account.user._id.toString()} account={account._id.toString()} notifyUser={false} notifyAdmin={true} />
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default AccountPage;
