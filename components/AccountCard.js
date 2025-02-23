import Link from "next/link";
import Image from "next/image";
import NewAccount from "@/components/NewAccount";
import CreateUpgradedAccount from "./CreateUpgradedAccount";
import Account from "@/models/Account";
import User from "@/models/User";
import dbConnect from "@/dbConnect";
import { revalidatePath } from "next/cache";
import ChangeAccountStatus from "./ChangeAccountStatus";
import SavePayoutDate from "./SavePayoutDate";
import PayoutRequestDone from "./PayoutRequestDone";
import SendMoney from "./SendMoney";

const SaveNewAccount = async ({ number, id }) => {
  "use server";
  try {
    await dbConnect();
    const newAccount = await Account.findById(id);
    if (!newAccount) return false;
    newAccount.number = number;
    newAccount.status = "Live";
    newAccount.activities.push({ title: "Το account αγοράστηκε", description: "Το account αγοράστηκε από τον χρήστη" });
    newAccount.purchaseDate = new Date();
    newAccount.note = "Το account αγοράστηκε αλλά ακόμα δεν έχει ελεγχθεί";
    newAccount.isOnBoarding = true;
    await newAccount.save();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const DeleteAccount = async ({ id }) => {
  "use server";
  try {
    dbConnect();
    const account = await Account.findById(id).populate("user");
    if (!account) return false;
    account.user.accounts.pull(id);
    await account.user.save();

    const deletedAccount = await Account.findByIdAndDelete(id);
    if (!deletedAccount) return false;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const UpgradeAccount = async ({ number, passedAccountNumber, passedAccountId, phase, capital, user, company }) => {
  "use server";
  try {
    dbConnect();
    const newAccount = new Account({
      user: user,
      company: company,
      number: number,
      capital: capital,
      phase: phase + 1,
      balance: capital,
      status: "Live",
      note: "Το νέο account δημιουργήθηκε αλλά ακόμα δεν έχει μπει κάποιο trade",
      isOnBoarding: true,
    });
    newAccount.activities.push({ title: "Το νέο account δηλώθηκε", description: `Το account ${passedAccountNumber} έγινε upgrade στο ${number}` });
    await newAccount.save();

    const userObj = await User.findById(user);
    userObj.accounts.pull(passedAccountId);
    userObj.accounts.push(newAccount._id);
    await userObj.save();

    const oldAccount = await Account.findById(passedAccountId);
    oldAccount.status = "UpgradeDone";
    oldAccount.activities.push({ title: "Το account πέρασε", description: `Αυτό το account έγινε upgrade στο ${number}` });
    oldAccount.upgradedDate = new Date();
    await oldAccount.save();
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const ChangeStatus = async ({ accountId }) => {
  "use server";
  try {
    const account = await Account.findById(accountId);
    if (!account) return false;

    if (account.status === "Live") {
      account.isOnBoarding = !account.isOnBoarding;
    }

    await account.save();
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const SaveDate = async ({ number, day, month, year }) => {
  "use server";
  try {
    dbConnect();
    const account = await Account.findOne({ number: number });
    account.payoutRequestDate = {};
    account.payoutRequestDate.day = day;
    account.payoutRequestDate.month = month;
    account.payoutRequestDate.year = year;
    await account.save();
    return true;
  } catch (error) {
    console.log(error);
  } finally {
    revalidatePath("/", "layout");
  }
};

const PayoutReqDone = async (number) => {
  "use server";
  try {
    dbConnect();
    const account = await Account.findOne({ number: number });
    if (!account) return false;

    if (!account?.activities) account.activities = {};
    account.activities.push({ title: "Έγινε payout request", description: `Το payout request για το account ${number} έχει γίνει` });
    account.status = "PayoutRequestDone";
    account.payoutRequestDoneDate = new Date();
    await account.save();
    return true;
  } catch (error) {
    console.log(error);
  } finally {
    revalidatePath("/", "layout");
  }
};

const AccountCard = ({ admin, id, number, company, balance, phase, note, status, instructions, userId, companyId, capital, isOnBoarding, thereIsDate, payoutRequestDay, payoutRequestMonth, payoutRequestYear }) => {
  return (
    <div className={`${isOnBoarding ? "border-2 border-red-700" : "border-2 border-gray-700"} p-4 rounded-md w-[350px] flex flex-col gap-4 bg-gray-950 transition-all duration-300`}>
      <div className="grid grid-cols-12">
        <div className="col-span-10 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              {status === "Live" && <ChangeAccountStatus ChangeStatus={ChangeStatus} accountId={id} isOnBoarding={isOnBoarding} />}
              <div>🏢 {company}</div>
            </div>
          </div>

          <div className={`${status === "WaitingPurchase" ? "text-sm text-gray-500" : "text-xl"}`}>{number}</div>

          <div>
            💵
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(balance)}
          </div>
        </div>

        <div className="col-span-2 flex flex-col justify-end gap-1">
          {phase === 3 && <div className="bg-orange-400 rounded-sm h-[22px]"></div>}
          {(phase === 2 || phase === 3) && <div className={`${phase === 2 && "bg-blue-400"} ${phase === 3 && "bg-orange-400"} rounded-sm h-[22]`}></div>}
          <div className={`${phase === 1 && "bg-green-400"} ${phase === 2 && "bg-blue-400"} ${phase === 3 && "bg-orange-400"} rounded-sm h-[22]`}></div>
        </div>
      </div>
      {/* Διάφορα status */}
      {status === "Live" && (
        <div className="text-sm text-gray-500 text-justify">
          {isOnBoarding && <div>Άνοιξε ένα trade 0.01 lots για να σιγουρευτείς ότι το account αυτό είναι έτοιμο για trading. Μετά πάτησε την κόκκινη κουκίδα πάνω αριστερά για να ενεργοποιήσεις το account.</div>}
          {!isOnBoarding && <div>{instructions}</div>}
        </div>
      )}

      {status === "WaitingPurchase" && (
        <>
          <div className={`text-sm flex items-center justify-start gap-4 border border-gray-700 px-4 py-2 rounded ${note && note !== "" ? "animate-bounce" : "opacity-25"}`}>
            <div className="">
              <Image src="/warning.svg" width={16} height={16} alt="" />
            </div>
            <div>Νέα αγορά account</div>
          </div>
          <div className="text-sm text-gray-500 text-justify">
            Αφού αγοράσεις ένα account των ${balance.toLocaleString("en-US")} από {company} γράψε τον αριθμό του ακριβώς από κάτω και πάτα το κουμπί Αποθήκευση.
          </div>
          <div className="text-sm text-gray-500 text-justify">
            <span className="text-green-500">✔</span> Αν αγοράσεις το account την ίδια μέρα στον λογαριασμό σου θα πιστωθούν 10$ για να τα πάρεις στο επόμενο payout σου.
          </div>
          <div className="text-sm text-gray-500 text-justify">
            <span className="text-red-500">❌</span> Κάθε ημέρα που καθυστερείς να αγοράσεις το account, πέραν της δεύτερης, έχεις ποινή 10$.
          </div>
          <NewAccount admin={admin} id={id} SaveNewAccount={SaveNewAccount} DeleteAccount={DeleteAccount} />
        </>
      )}

      {status === "NeedUpgrade" && (
        <>
          <div className={`text-sm flex items-center justify-start gap-4 border border-gray-700 px-4 py-2 rounded ${note && note !== "" ? "animate-bounce" : "opacity-25"}`}>
            <div className="">
              <Image src="/warning.svg" width={16} height={16} alt="" />
            </div>
            <div>Κάνε upgrade το account</div>
          </div>
          <div className="text-sm text-gray-500 text-justify">Σιγουρέψου ότι έχεις συμπληρώσει τις minimum trading ημέρες από την σελίδα της εταιρίας και δήλωσε στην σελίδα μας το νέο account.</div>
          <CreateUpgradedAccount UpgradeAccount={UpgradeAccount} passedAccountNumber={number} passedAccountId={id} phase={phase} capital={capital} user={userId} company={companyId} />
        </>
      )}

      {status === "WaitingPayout" && (
        <div>
          {!thereIsDate && (
            <div className="flex flex-col gap-2">
              <div className={`text-sm flex items-center justify-start gap-4 border border-gray-700 px-4 py-2 rounded ${note && note !== "" ? "animate-bounce" : "opacity-25"}`}>
                <div className="">
                  <Image src="/warning.svg" width={16} height={16} alt="" />
                </div>
                <div>Εισαγωγή ημερομηνίας payout</div>
              </div>
              <div className="text-sm text-gray-500 text-justify">Πήγαινε στην ιστοσελίδα της εταιρίας, δες πότε μπορείς να κάνεις payout request και ποθήκευσε την ημερομηνία.</div>
              <SavePayoutDate number={number} SaveDate={SaveDate} />
            </div>
          )}

          <div>
            <div className="flex flex-col gap-2">
              <div className={`text-sm flex items-center justify-start gap-4 border border-gray-700 px-4 py-2 rounded ${note && note !== "" ? "animate-bounce" : "opacity-25"}`}>
                <div className="">
                  <Image src="/warning.svg" width={16} height={16} alt="" />
                </div>
                <div>
                  Κάνε payout request στις {payoutRequestDay}/{payoutRequestMonth}/{payoutRequestYear}
                </div>
              </div>
              <div className="text-sm text-gray-500 text-justify">
                Κάνε payout request από την {company} στις {payoutRequestDay}/{payoutRequestMonth}/{payoutRequestYear} και ΜΕΤΑ πάτησε το μπλε κουμπί. Δηλαδή αυτό το μπλε κουμπί πρέπει να το πατήσεις ΑΦΟΥ κάνεις payout request και περιμένεις να σου στείλουν τα λέφτα! ΟΧΙ ΤΩΡΑ ΠΟΥ ΔΕΝ ΕΧΕΙΣ ΚΑΝΕΙ ΑΚΟΜΑ.
              </div>
              <PayoutRequestDone number={number} PayoutReqDone={PayoutReqDone} />
            </div>
          </div>
        </div>
      )}

      {status === "PayoutRequestDone" && (
        <div>
          <div>
            <div className="flex flex-col gap-2">
              <div className={`text-sm flex items-center justify-start gap-4 border border-gray-700 px-4 py-2 rounded ${note && note !== "" ? "animate-bounce" : "opacity-25"}`}>
                <div className="">
                  <Image src="/warning.svg" width={16} height={16} alt="" />
                </div>
                <div>Μοίρασε τα κέρδη</div>
              </div>
              <div className="text-sm text-gray-500 text-justify">Αφού η εταιρία σου στείλει τα λεφτά πήγαινε στο wallet σου και δες πόσα λεφτά σου έστειλε. ΜΗΝ υπολογίσεις με το μυαλό σου. ΜΗΝ βάλεις το νούμερο που είδες στην ιστοσελίδα τους. Μπες στο wallet σου και δεν πόσα λεφτά μπήκαν όντως! Γράψε το από κάτω και στείλε τα λεφτά που σου ζητάει.</div>
              <SendMoney />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountCard;
