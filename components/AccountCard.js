import Link from "next/link";
import Image from "next/image";
import NewAccount from "@/components/NewAccount";
import Account from "@/models/Account";
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

const AccountCard = ({ id, number, company, balance, phase, note, status, link }) => {
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
      <div className={`text-sm flex items-center justify-start gap-4 border border-gray-700 px-4 py-2 rounded ${note && note !== "" ? "animate-bounce" : "opacity-25"}`}>
        <div className="">
          <Image src="/warning.svg" width={16} height={16} alt="" />
        </div>
        <div>{note}</div>
      </div>
      {/* Διάφορα status */}
      {status === "WaitingPurchase" && (
        <>
          <div className="text-sm text-gray-500">
            Αφού αγοράσεις ένα account των ${balance.toLocaleString("en-US")} από {company} γράψε τον αριθμό του ακριβώς από κάτω και πάτα το κουμπί Αποθήκευση
          </div>
          <NewAccount id={id} SaveNewAccount={SaveNewAccount} />
        </>
      )}
    </div>
  );
};

export default AccountCard;
