import Link from "next/link";
import Image from "next/image";
import NewAccount from "@/components/NewAccount";
import CreateUpgradedAccount from "./CreateUpgradedAccount";
import Account from "@/models/Account";
import User from "@/models/User";
import dbConnect from "@/dbConnect";
import { revalidatePath } from "next/cache";

const SaveNewAccount = async ({ number, id }) => {
  "use server";
  try {
    await dbConnect();
    revalidatePath("/", "layout");
    const newAccount = await Account.findById(id);
    if (!newAccount) return false;
    newAccount.number = number;
    newAccount.status = "Live";
    newAccount.activities.push({ title: "Το account αγοράστηκε", description: "no description" });
    newAccount.purchaseDate = new Date();
    newAccount.note = "";
    await newAccount.save();
    return true;
  } catch (error) {
    console.log(error);
    return false;
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
      note: "",
    });
    newAccount.activities.push({ title: "Account created", description: `Account ${passedAccountNumber} upgraded to ${number}` });
    await newAccount.save();

    const userObj = await User.findById(user);
    userObj.accounts.pull(passedAccountId);
    userObj.accounts.push(newAccount._id);
    await userObj.save();

    const oldAccount = await Account.findById(passedAccountId);
    oldAccount.status = "UpgradeDone";
    oldAccount.activities.push({ title: "Account passed", description: `This account upgraded to ${number}` });
    oldAccount.upgradedDate = new Date();
    await oldAccount.save();
  } catch (error) {
    console.log(error);
    return false;
  }
};

const AccountCard = ({ id, number, company, balance, phase, note, status, link, instructions, userId, companyId, capital }) => {
  console.log("ID:", id);
  console.log("Number:", number);
  console.log("Company:", company);
  console.log("Balance:", balance);
  console.log("Phase:", phase);
  console.log("Note:", note);
  console.log("Status:", status);
  console.log("Link:", link);
  console.log("Instructions:", instructions);
  console.log("User ID:", userId);
  console.log("Company ID:", companyId);
  console.log("Capital:", capital);

  return (
    <div className={`border border-gray-700 p-4 rounded-md flex flex-col gap-4 bg-gray-950 hover:scale-[102%] transition-transform duration-300`}>
      <div className="grid grid-cols-12">
        <div className="col-span-10 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div>{company}</div>
            <a href={link} target="_blank">
              <Image src="/link.svg" alt="" width={16} height={16} />
            </a>
          </div>
          <div className="text-xl">{number}</div>
          <div>
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
          <div className="text-sm text-gray-500 text-justify">{instructions}</div>
          <NewAccount id={id} SaveNewAccount={SaveNewAccount} />
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
          <div className="text-sm text-gray-500 text-justify">Σιγουρέψου ότι έχεις συμπληρώσει τις minimum trading ημέρες και πέρασε στην σελίδα μας το νέο account που σου έχει στείλει η εταιρία.</div>
          <div className="text-sm text-gray-500 text-justify">{instructions}</div>
          <CreateUpgradedAccount UpgradeAccount={UpgradeAccount} passedAccountNumber={number} passedAccountId={id} phase={phase} capital={capital} user={userId} company={companyId} />
        </>
      )}
    </div>
  );
};

export default AccountCard;
