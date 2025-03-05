import User from "@/models/User";
import AdminMenuItem from "./AdminMenuItem";
import dbConnect from "@/dbConnect";

const GetNewUsers = async () => {
  "use server";
  try {
    await dbConnect();
    return await User.countDocuments({ accepted: false });
  } catch (error) {
    console.log("Υπήρξε error στην GetNewUsers στο /components/AdminMenuItems/NewUsers.js", error);
  }
};

const NewUsers = async () => {
  const numberOfNewUsers = await GetNewUsers();
  return <AdminMenuItem link="/admin/new-users" icon="/new-user.svg" color="bg-purple-500" text="New Users" />;
};

export default NewUsers;
