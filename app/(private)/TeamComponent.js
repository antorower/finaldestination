export const dynamic = "force-dynamic";

import dbConnect from "@/dbConnect";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import RemoveTeamForm from "./RemoveTeamForm";
import AddTeamForm from "./AddTeamForm";

const AddUserToTeam = async ({ userId, traderId }) => {
  "use server";
  try {
    await dbConnect();

    const user = await User.findById(traderId);
    if (!user) {
      return { error: true, message: "Ο χρήστης δεν βρέθηκε." };
    }

    // Αν το team δεν υπάρχει, αρχικοποίησέ το
    if (!user.team) {
      user.team = [];
    }

    // Ελέγχουμε αν το userId υπάρχει ήδη στο team
    if (!user.team.includes(userId)) {
      user.team.push(userId);
      await user.save();
      return { error: false, message: "Ο χρήστης προστέθηκε στην ομάδα." };
    } else {
      return { error: false, message: "Ο χρήστης είναι ήδη στην ομάδα." };
    }
  } catch (error) {
    console.log("Υπήρξε error στην AddUser στο /admin/trader/[traderId]", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const RemoveUserFromTeam = async ({ userId, traderId }) => {
  "use server";
  try {
    await dbConnect();

    const user = await User.findById(traderId);
    if (!user) {
      return { error: true, message: "Ο χρήστης δεν βρέθηκε." };
    }

    // Αν το team δεν υπάρχει ή είναι άδειο, δεν υπάρχει κάτι να αφαιρέσουμε
    if (!user.team || user.team.length === 0) {
      return { error: false, message: "Η ομάδα είναι ήδη άδεια." };
    }

    // Φιλτράρουμε το team ώστε να αφαιρέσουμε το userId
    const updatedTeam = user.team.filter((id) => id.toString() !== userId.toString());

    // Αν το μήκος δεν άλλαξε, σημαίνει ότι ο χρήστης δεν ήταν στην ομάδα
    if (updatedTeam.length === user.team.length) {
      return { error: false, message: "Ο χρήστης δεν ήταν στην ομάδα." };
    }

    // Ενημερώνουμε το user.team και αποθηκεύουμε
    user.team = updatedTeam;
    await user.save();

    return { error: false, message: "Ο χρήστης αφαιρέθηκε από την ομάδα." };
  } catch (error) {
    console.log("Υπήρξε error στην RemoveUserFromTeam στο /admin/trader/[traderId]", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const GetAllUsers = async () => {
  "use server";
  try {
    await dbConnect();
    return await User.find()
      .select("_id firstName lastName")
      .lean()
      .then((users) => users.map((user) => ({ ...user, _id: user._id.toString() })));
  } catch (error) {
    console.log("Υπήρξε error στην GetAllUsers", error);
    return false;
  }
};

const TeamComponent = async ({ mode, user }) => {
  if (mode !== "updateteam") return null;

  const allUsers = await GetAllUsers();

  return (
    <div className="mt-4">
      {/* Εμφάνιση χρηστών που είναι ήδη στην ομάδα */}
      <div className="flex gap-4 justify-center flex-wrap">
        {user.team &&
          user.team.length > 0 &&
          user.team.map((userFromTeam) => {
            return (
              <RemoveTeamForm RemoveUserFromTeam={RemoveUserFromTeam} traderId={user._id.toString()} firstName={userFromTeam.firstName} lastName={userFromTeam.lastName} userId={userFromTeam._id.toString()} key={`user-team-remove-${userFromTeam._id.toString()}`}>
                {userFromTeam.firstName} {userFromTeam.lastName}
              </RemoveTeamForm>
            );
          })}
      </div>

      {/* Φιλτράρουμε το allUsers για να εξαιρέσουμε όσους είναι ήδη στην ομάδα */}
      <div className="flex gap-4 justify-center flex-wrap bg-blue-200 p-4 rounded mt-8">
        {allUsers &&
          allUsers.length > 0 &&
          allUsers
            .filter((userForTeam) => !user.team.some((teamMember) => teamMember._id.toString() === userForTeam._id.toString()))
            .map((userForTeam) => {
              return (
                <AddTeamForm AddUserToTeam={AddUserToTeam} traderId={user._id.toString()} firstName={userForTeam.firstName} lastName={userForTeam.lastName} userId={userForTeam._id.toString()} key={`user-team-add-${userForTeam._id.toString()}`}>
                  {userForTeam.firstName} {userForTeam.lastName}
                </AddTeamForm>
              );
            })}
      </div>
    </div>
  );
};

export default TeamComponent;
