import Menu from "@/components/Menu";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import Account from "@/models/Account";
import dbConnect from "@/dbConnect";
import AccountCard from "@/components/AccountCard";

export const GetAccounts = async () => {
  "use server";
  try {
    await dbConnect();
    const accounts = await Account.find().populate("user company lastTrade");
    return accounts;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const Accounts = async () => {
  const accounts = await GetAccounts();
  const { sessionClaims } = await auth();

  if (!sessionClaims.metadata.owner) return <div className="m-auto">You don't have permissions</div>;

  return (
    <div className="flex flex-col gap-4 p-8">
      <Menu activeMenu="Accounts" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {accounts &&
          accounts.length > 0 &&
          accounts.map((account) => {
            return (
              <AccountCard
                firstName={account.user.firstName}
                lastName={account.user.lastName}
                key={`account-${account._id.toString()}`}
                id={account._id.toString()}
                status={account.status}
                number={account.number || "-"}
                company={account.company.name}
                balance={account.balance}
                phase={account.phase}
                note={account.note || "-"}
                link={account.company.link}
                instructions={account.company.phases[account.phase - 1].instructions}
                userId={account.user._id.toString()}
                companyId={account.company._id.toString()}
                capital={account.capital}
              />
            );
          })}
      </div>
    </div>
  );
};

export default Accounts;
