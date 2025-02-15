import User from "@/models/User";
import Company from "@/models/Company";
import dbConnect from "@/dbConnect";
import Menu from "@/components/Menu";
import AddAccountForm from "@/components/AddAccountForm";
import Account from "@/models/Account";
import { revalidatePath } from "next/cache";

export const GetUser = async (userId) => {
  "use server";
  try {
    await dbConnect();
    return await User.findById(userId).populate("accounts");
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const GetCompanies = async (userId) => {
  "use server";
  try {
    await dbConnect();

    // Χρήση lean() για να δουλέψεις με απλά αντικείμενα
    const companies = await Company.find().select("name").lean();

    // Μετατροπή _id σε string
    return companies.map((company) => ({
      ...company,
      _id: company._id.toString(),
    }));
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const AddNewAccount = async (account) => {
  "use server";
  try {
    await dbConnect();
    const newAccount = new Account(account);
    await newAccount.save();

    const userObj = await User.findById(account.user);
    userObj.accounts.push(newAccount._id);
    await userObj.save();

    return true;
  } catch (error) {
    console.log(error);
    return false;
  } finally {
    revalidatePath("/", "layout");
  }
};

const AddAccount = async ({ searchParams }) => {
  const params = await searchParams;
  const userId = params.user;
  const user = await GetUser(userId);
  const companies = await GetCompanies();
  if (!user) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col gap-4 p-8">
      <Menu activeMenu="Profile" />
      <AddAccountForm companies={companies} AddNewAccount={AddNewAccount} />
    </div>
  );
};

export default AddAccount;
