import dbConnect from "@/dbConnect";
import User from "@/models/User";
import Company from "@/models/Company";
import Account from "@/models/Account";
import { revalidatePath } from "next/cache";
import AddAccountLink from "./AddAccountLink";
import AddAccountForm from "./AddAccountForm";
import Link from "next/link";

const GetUser = async (id) => {
  "use server";
  try {
    await dbConnect();
    return await User.findById(id).populate("companies").populate("leader").populate("family").populate("team").populate("beneficiaries").populate("accounts");
  } catch (error) {
    console.log("Υπήρξε error στην GetUser στο /admin/trader/[id]", error);
    return false;
  }
};

const CreateNewAccount = async ({ id, company, capital }) => {
  "use server";
  if (!id || !company || !capital) return { error: true, message: "Συμπλήρωσε όλα τα στοιχεία" };
  try {
    await dbConnect();
    const newAccount = new Account({
      user: id,
      company: company,
      capital: capital,
      phase: 1,
      balance: capital,
      status: "Pending Purchase",
      isOnBoarding: false,
      needBalanceUpdate: false,
      activities: [{ title: "Αγορά account", description: `Εστάλησαν λεφτά για αγορά ενός account των $${capital}` }],
    });
    await newAccount.save();

    const user = await User.findById(id);
    if (!user) return { error: true, message: "Δεν βρέθηκε ο χρήστης. Επικοιώνησε με τον Αντώνη." };
    user.accounts.push(newAccount._id);
    user.allAccounts.phase1 += 1;
    await user.save();

    return { error: false, message: "Το account προσετέθη" };
  } catch (error) {
    console.log("Υπήρξε error στην CreateNewAccount στο /admin/trader/[id]", error);
    return { error: true, message: error.message };
  }
};

const Trader = async ({ params, searchParams }) => {
  const { id } = await params;
  const { mode } = await searchParams;
  const user = await GetUser(id);

  const simpleCompanies = user.companies.length > 0 ? user.companies.map((company) => ({ _id: company._id.toString(), name: company.name })) : [];

  return (
    <div className="flex flex-col gap-4">
      <Link href={`/admin/trader/${id}`} className="w-full bg-blue-500 text-white font-bold text-2xl p-4 text-center rounded">
        {user.firstName} {user.lastName}
      </Link>
      {mode === "addaccount" && (
        <div className="flex justify-center">
          <AddAccountForm CreateNewAccount={CreateNewAccount} companies={simpleCompanies} id={id} />
        </div>
      )}
      <div className="fixed bottom-5 right-5">
        <AddAccountLink userId={id} />
      </div>
    </div>
  );
};

export default Trader;
