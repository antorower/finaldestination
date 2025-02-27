export const dynamic = "force-dynamic";

import User from "@/models/User";
import dbConnect from "@/dbConnect";
import PageTransition from "@/components/PageTransition";
import AcceptUser from "./AcceptUser";
import { revalidatePath } from "next/cache";

const GetNewUsers = async () => {
  "use server";
  try {
    await dbConnect();
    return await User.find({ accepted: false }).select("firstName lastName telephone");
  } catch (error) {
    console.log("Υπήρξε error στην GetNewUsers στο /admin/new-users", error);
    return false;
  }
};

const Accept = async ({ userId }) => {
  "use server";
  try {
    await dbConnect();
    await User.updateOne({ _id: userId }, { $set: { accepted: true } });
    return { error: false, message: "Ο user έγινε αποδεκτός" };
  } catch (error) {
    console.log("Υπήρξε error στην Acccept στο /admin/new-users", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const Reject = async ({ userId }) => {
  "use server";
  try {
    await dbConnect();
    await User.deleteOne({ _id: userId });
    return { error: false, message: "Ο user δεν έγινε δεκτός" };
  } catch (error) {
    console.log("Υπήρξε error στην Reject στο /admin/new-users", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const NewUsersList = async () => {
  const newUsers = await GetNewUsers();

  if (!newUsers)
    return (
      <PageTransition>
        <div className="flex items-center justify-center animate-pulse text-lg text-gray-700">Κάτι πήγε στραβά κατά την φόρτωση των νέων traders</div>
      </PageTransition>
    );
  if (newUsers.length === 0)
    return (
      <PageTransition>
        <div className="flex items-center justify-center animate-pulse text-lg text-gray-700">Δεν υπάρχουν νέοι traders</div>;
      </PageTransition>
    );
  return (
    <PageTransition>
      <div className="flex flex-wrap gap-8 justify-center">
        {newUsers.map((user) => {
          return (
            <div className="p-4 bg-purple-500 rounded-lg text-2xl text-white font-bold flex flex-col gap-2" key={`new-user-${user._id.toString()}`}>
              <div className="text-center">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-center font-normal">{user.telephone}</div>
              <AcceptUser userId={user._id.toString()} Accept={Accept} Reject={Reject} />
            </div>
          );
        })}
      </div>
    </PageTransition>
  );
};

export default NewUsersList;

const NewUserItem = ({ firstName, lastName, telephone, questions }) => {
  return <div>flksdjfkjd</div>;
};
