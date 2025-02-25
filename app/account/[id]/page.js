import Account from "@/models/Account";
import dbConnect from "@/dbConnect";
import PageTransition from "@/components/PageTransition";
import SaveAccountNumberForm from "./SaveAccountNumberForm";
import { revalidatePath } from "next/cache";

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
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην SaveNewAccountNumber στο /account/[id]", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const AccountPage = async ({ params }) => {
  const { id } = await params;

  const account = await GetAccount(id);
  console.log(account);
  return (
    <PageTransition>
      <div className="flex flex-col gap-4">
        <div className="bg-blue-500 p-4 rounded text-white font-bold text-xl text-center">{account.number || "Account Number: Εκκρεμεί"}</div>
        <div className="text-center bg-gray-100 rounded p-4 text-gray-700 flex justify-between">
          <div>
            {account.user.firstName} {account.user.lastName}
          </div>
          <div>{account.company.name}</div>
        </div>
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
            {account.isOnBoarding && <div>Is</div>}
            {!account.isOnBoarding && <div>Is Not</div>}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default AccountPage;
