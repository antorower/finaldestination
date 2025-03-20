export const dynamic = "force-dynamic";

import AddAccountForm from "./AddAccountForm";
import dbConnect from "@/dbConnect";
import Account from "@/models/Account";
import User from "@/models/User";
import { AddActivity } from "@/library/AddActivity";

const CreateNewAccount = async ({ id, company, capital, phase, balance, number }) => {
  "use server";
  if (!id || !company || !capital) return { error: true, message: "Συμπλήρωσε όλα τα στοιχεία" };
  try {
    await dbConnect();
    const newAccount = new Account({
      user: id,
      number: number || undefined,
      company: company,
      capital: capital,
      phase: phase,
      balance: balance,
      status: number ? "Live" : "Pending Purchase",
      isOnBoarding: true,
      needBalanceUpdate: false,
      note: number ? null : "Νέα Αγορά Account",
    });
    await newAccount.save();

    const user = await User.findById(id);
    if (!user) return { error: true, message: "Δεν βρέθηκε ο χρήστης. Επικοιώνησε με τον Αντώνη." };
    user.accounts.push(newAccount._id);

    if (Number(phase) === 1) user.allAccounts.phase1 += 1;
    if (Number(phase) === 2) user.allAccounts.phase2 += 1;
    if (Number(phase) === 3) user.allAccounts.phase3 += 1;
    await user.save();

    if (number) {
      await AddActivity({ title: "Προστέθηκε Account", description: `Ο διαχειριστής πρόσθεσε ένα υφιστάμενο account στον χρήστη`, user: id, account: newAccount._id.toString() });
    } else {
      await AddActivity({ title: "Αγορά Νέου Account", description: `Εστάλησαν λεφτά για αγορά νέου account`, user: id, account: newAccount._id.toString() });
    }

    return { error: false, message: "Το account προσετέθη" };
  } catch (error) {
    console.log("Υπήρξε error στην CreateNewAccount στο /admin/trader/[id]", error);
    return { error: true, message: error.message };
  }
};

const AddAccountComponent = ({ mode, id, companies }) => {
  if (mode !== "addaccount") return null;

  return (
    <div className="m-auto">
      <AddAccountForm CreateNewAccount={CreateNewAccount} id={id} companies={companies} />
    </div>
  );
};

export default AddAccountComponent;
