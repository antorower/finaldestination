import dbConnect from "@/dbConnect";
import Account from "@/models/Account";
import { revalidatePath } from "next/cache";

const GetAccounts = async () => {
  "use server";
  return null;
};

const Accounts = () => {
  return <div>content</div>;
};

export default Accounts;
