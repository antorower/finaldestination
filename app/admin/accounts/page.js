export const dynamic = "force-dynamic";

import dbConnect from "@/dbConnect";
import Account from "@/models/Account";
import { revalidatePath } from "next/cache";

const Accounts = () => {
  return <div>content</div>;
};

export default Accounts;
