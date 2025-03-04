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

const GetAccount = async (id) => {
  "use server";
  await dbConnect();
  try {
    return Account.findById(id).populate("user").populate("company").populate("lastTrade");
  } catch (error) {
    console.log("Υπήρξε error στην GetAccount στο /account/[id]", error);
    return false;
  }
};

const SaveNewAccountNumber = async ({ accountId, newNumber }) => {
  "use server";
  if (!accountId || !newNumber) return { error: true, message: "Συμπλήρωσε το account number" };
  try {
    await dbConnect();
    const account = await Account.findById(accountId);
    account.number = newNumber;
    account.status = "Live";
    account.isOnBoarding = true;
    account.note = "Χρειάζεται Ενεργοποίηση";
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

const AccountPage = async ({ params }) => {
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
