import AllPairs from "./AllPairs";
import NewPair from "./NewPair";
import dbConnect from "@/dbConnect";
import { revalidatePath } from "next/cache";
import Pair from "@/models/Pair";
import PageTransition from "@/components/PageTransition";

const SaveNewPair = async ({ name, lots, priority, costFactor }) => {
  "use server";
  try {
    await dbConnect();

    // Βρίσκει το Pair με βάση το όνομα και αν δεν υπάρχει, το δημιουργεί
    await Pair.findOneAndUpdate(
      { name }, // Κριτήριο αναζήτησης
      { $set: { lots, priority, costFactor } }, // Δεδομένα για ενημέρωση
      { upsert: true, new: true } // Αν δεν υπάρχει, το δημιουργεί
    );

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε πρόβλημα στην SaveNewPair στο admin/pairs", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const Pairs = async ({ searchParams }) => {
  const { name, lots, priority, costFactor } = await searchParams;
  console.log(name);
  return (
    <PageTransition>
      <div className="flex flex-col gap-8">
        <AllPairs />
        <div className="w-full max-w-[300px] m-auto">
          <NewPair SaveNewPair={SaveNewPair} nameVar={name} lotsVar={lots} priorityVar={priority} costFactorVar={costFactor} />
        </div>
      </div>
    </PageTransition>
  );
};

export default Pairs;
