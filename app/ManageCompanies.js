import dbConnect from "@/dbConnect";
import { revalidatePath } from "next/cache";
import User from "@/models/User";
import AddCompanyButton from "./AddCompanyButton";
import RemoveCompanyButton from "./RemoveCompanyButton";

const ActivateCompany = async ({ userId, companyId }) => {
  "use server";
  try {
    await dbConnect();

    // Ενημέρωση του user ώστε να προσθέσει το companyId αν δεν υπάρχει ήδη
    const result = await User.updateOne(
      { _id: userId },
      { $addToSet: { companies: companyId } } // Προσθέτει ΜΟΝΟ αν δεν υπάρχει ήδη
    );

    if (result.modifiedCount === 0) {
      return { error: false };
    }

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην ActivateCompany στο root/ManageCompanies", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const DeactivateCompany = async ({ userId, companyId }) => {
  "use server";
  try {
    await dbConnect();

    // Ενημέρωση του user ώστε να αφαιρέσει το companyId από το array
    const result = await User.updateOne(
      { _id: userId },
      { $pull: { companies: companyId } } // Αφαιρεί το companyId από το array
    );

    if (result.modifiedCount === 0) {
      return { error: false };
    }

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην DeactivateCompany στο root/ManageCompanies", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const ManageCompanies = ({ userId, allCompanies = [], userCompanies = [] }) => {
  // Μετατροπή userCompanies σε array από strings για σωστή σύγκριση
  const safeUserCompanies = Array.isArray(userCompanies) ? userCompanies.map((company) => company._id.toString()) : [];

  // Φιλτράρουμε το allCompanies ώστε να εμφανίζονται μόνο οι εταιρείες που ΔΕΝ είναι στο userCompanies
  const inactiveCompanies = allCompanies.filter((company) => !safeUserCompanies.includes(company._id.toString()));

  return (
    <div className="flex items-center justify-center gap-6">
      {/* Εμφανίζει τις εταιρείες του χρήστη που μπορούν να αφαιρεθούν */}
      {userCompanies.length > 0 && userCompanies.map((company) => <RemoveCompanyButton DeactivateCompany={DeactivateCompany} userId={userId} companyId={company._id.toString()} key={`active-company-${company._id.toString()}`} name={company.name} />)}
      {/* Εμφανίζει ΜΟΝΟ τις εταιρείες που δεν είναι ήδη στο userCompanies */}
      {inactiveCompanies.length > 0 && inactiveCompanies.map((company) => <AddCompanyButton ActivateCompany={ActivateCompany} userId={userId} companyId={company._id.toString()} key={`inactive-company-${company._id.toString()}`} name={company.name} />)}
    </div>
  );
};

export default ManageCompanies;
