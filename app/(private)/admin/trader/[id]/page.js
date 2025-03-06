export const dynamic = "force-dynamic";

import dbConnect from "@/dbConnect";
import User from "@/models/User";
import Company from "@/models/Company";
import Account from "@/models/Account";
import { revalidatePath } from "next/cache";
import AddAccountLink from "./AddAccountLink";
import AddAccountForm from "./AddAccountForm";
import Link from "next/link";
import { AddActivity } from "@/library/AddActivity";
import AddLeaderForm from "./AddLeaderForm";
import AddFamilyForm from "./AddFamilyForm";
import AddBeneficiaryForm from "./AddBeneficiaryForm";
import RemoveBeneficiaryForm from "./RemoveBeneficiaryForm";

const GetUser = async (id) => {
  "use server";
  try {
    await dbConnect();
    return await User.findById(id).populate("companies").populate("leader").populate("family").populate("team").populate("accounts").populate({
      path: "beneficiaries.user",
      model: "User",
      select: "firstName lastName bybitEmail", // Επιλέξτε τα πεδία που θέλετε να συμπεριλάβετε
    });
  } catch (error) {
    console.log("Υπήρξε error στην GetUser στο /admin/trader/[id]", error);
    return false;
  }
};

const CreateNewAccount = async ({ id, company, capital, phase, balance, number }) => {
  "use server";
  if (!id || !company || !capital) return { error: true, message: "Συμπλήρωσε όλα τα στοιχεία" };
  try {
    await dbConnect();
    const newAccount = new Account({
      user: id,
      number: number || null,
      company: company,
      capital: capital,
      phase: phase,
      balance: balance,
      status: number ? "Live" : "Pending Purchase",
      isOnBoarding: phase === 1 ? false : true,
      needBalanceUpdate: false,
      note: number ? null : "Νέα Αγορά Account",
    });
    await newAccount.save();

    const user = await User.findById(id);
    if (!user) return { error: true, message: "Δεν βρέθηκε ο χρήστης. Επικοιώνησε με τον Αντώνη." };
    user.accounts.push(newAccount._id);
    if (phase === 1) user.allAccounts.phase1 += 1;
    if (phase === 2) user.allAccounts.phase2 += 1;
    if (phase === 3) user.allAccounts.phase3 += 1;
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

const GetAllUsers = async () => {
  "use server";
  try {
    await dbConnect();
    return await User.find()
      .select("_id firstName lastName")
      .lean()
      .then((users) => users.map((user) => ({ ...user, _id: user._id.toString() })));
  } catch (error) {
    console.log("Υπήρξε error στην GetAllUsers", error);
    return false;
  }
};

const SetLeader = async ({ userId, leaderId }) => {
  "use server";
  try {
    await dbConnect();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { leader: leaderId },
      { new: true } // Επιστρέφει το ενημερωμένο user object
    );

    if (!updatedUser) {
      return { error: true, message: "Ο χρήστης δεν βρέθηκε." };
    }

    return { error: false, message: "Ο αρχηγός ενημερώθηκε επιτυχώς." };
  } catch (error) {
    console.log("Υπήρξε error στην SetLeader στο /admin/trader", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const SetFamily = async ({ userId, familyId }) => {
  "use server";
  try {
    await dbConnect();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { family: familyId },
      { new: true } // Επιστρέφει το ενημερωμένο user object
    );

    if (!updatedUser) {
      return { error: true, message: "Ο χρήστης δεν βρέθηκε." };
    }

    return { error: false, message: "Ο αρχηγός ενημερώθηκε επιτυχώς." };
  } catch (error) {
    console.log("Υπήρξε error στην SetFamily στο /admin/trader", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const AddBeneficiary = async ({ userId, beneficiaryId, percentage }) => {
  "use server";
  try {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) return { error: true, message: "Ο χρήστης δεν βρέθηκε" };
    user.beneficiaries.push({ user: beneficiaryId, percentage: percentage });
    await user.save();
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην AddBeneficiary στο /admin/trader", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const RemoveBeneficiary = async ({ userId, beneficiaryId }) => {
  "use server";
  try {
    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return { error: true, message: "Ο χρήστης δεν βρέθηκε." };
    }

    // Φιλτράρουμε για να αφαιρέσουμε τον συγκεκριμένο beneficiary
    user.beneficiaries = user.beneficiaries.filter((b) => b.user.toString() !== beneficiaryId.toString());

    await user.save();

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην RemoveBeneficiary στο /admin/trader", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const Trader = async ({ params, searchParams }) => {
  const { id } = await params;
  const { mode } = await searchParams;
  const user = await GetUser(id);
  const allUsers = await GetAllUsers();

  const simpleCompanies = user.companies.length > 0 ? user.companies.map((company) => ({ _id: company._id.toString(), name: company.name })) : [];

  return (
    <div className="flex flex-col gap-4">
      <Link href={`/admin/trader/${id}`} className="w-full bg-blue-500 text-white font-bold text-2xl p-4 text-center rounded">
        {user.firstName} {user.lastName}
      </Link>
      <div className="flex justify-between px-2">
        <Link className={`text-blue-600 hover:text-blue-800 hover:underline ${mode === "beneficiaries" && "font-bold"}`} href={`/admin/trader/${id}?mode=beneficiaries`}>
          Beneficiaries
        </Link>
        <Link className={`text-blue-600 hover:text-blue-800 hover:underline ${mode === "leader" && "font-bold"}`} href={`/admin/trader/${id}?mode=leader`}>
          Leader
        </Link>
        <Link className={`text-blue-600 hover:text-blue-800 hover:underline ${mode === "family" && "font-bold"}`} href={`/admin/trader/${id}?mode=family`}>
          Family
        </Link>
        <Link className={`text-blue-600 hover:text-blue-800 hover:underline ${mode === "team" && "font-bold"}`} href={`/admin/trader/${id}?mode=team`}>
          Team
        </Link>
      </div>
      {mode === "addaccount" && (
        <div className="flex justify-center">
          <AddAccountForm CreateNewAccount={CreateNewAccount} companies={simpleCompanies} id={id} />
        </div>
      )}
      {mode === "leader" && (
        <div className="flex flex-col justify-center m-auto">
          <div className="text-center p-2 text-blue-500 font-bold text-2xl">Leader: {user.leader && `${user.leader.firstName} ${user.leader.lastName}`}</div>
          <AddLeaderForm userId={user._id.toString()} SetLeader={SetLeader} allUsers={allUsers} />
        </div>
      )}

      {mode === "family" && (
        <div className="flex flex-col justify-center m-auto">
          <div className="text-center p-2 text-blue-500 font-bold text-2xl">Family: {user.family && `${user.family.firstName} ${user.family.lastName}`}</div>
          <AddFamilyForm userId={user._id.toString()} SetFamily={SetFamily} allUsers={allUsers} />
        </div>
      )}

      {mode === "beneficiaries" && (
        <div className="flex flex-col justify-center m-auto">
          <div className="text-center p-4 text-white bg-blue-500 rounded font-bold flex flex-wrap gap-4 items-center justify-center">
            <div className="">Beneficiaries</div>
            {user.beneficiaries &&
              user.beneficiaries.length > 0 &&
              user.beneficiaries.map((beneficiary) => {
                return <RemoveBeneficiaryForm percentage={beneficiary.percentage} userId={user._id.toString()} beneficiaryId={beneficiary.user._id.toString()} RemoveBeneficiary={RemoveBeneficiary} firstName={beneficiary.user.firstName} lastName={beneficiary.user.lastName} key={`beneficiary-is-${beneficiary.user._id.toString()}`} className="" />;
              })}
          </div>
          <AddBeneficiaryForm userId={user._id.toString()} AddBeneficiary={AddBeneficiary} allUsers={allUsers} />
        </div>
      )}
      <div className="fixed bottom-5 right-5">
        <AddAccountLink userId={id} />
      </div>
    </div>
  );
};

export default Trader;
