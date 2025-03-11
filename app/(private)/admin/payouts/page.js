import dbConnect from "@/dbConnect";
import Payout from "@/models/Payout";
import AcceptPayout from "./AcceptPayout";
import Beneficiaries from "./Beneficiaries";
import { revalidatePath } from "next/cache";
import Invoice from "@/models/Invoice";
import User from "@/models/User";

const GetPayouts = async () => {
  "use server";
  try {
    await dbConnect();
    return await Payout.find({ status: "Open" })
      .populate({
        path: "user",
        select: "firstName lastName bybitEmail bybitUid beneficiaries share",
        populate: {
          path: "beneficiaries.user",
          select: "firstName lastName",
        },
      })
      .populate({
        path: "leader",
        select: "firstName lastName",
      })
      .populate({
        path: "account",
        select: "number balance timesPaid grossProfit netProfit",
        populate: {
          path: "company",
          select: "name",
        },
      })
      .lean();
  } catch (error) {
    console.log("Υπήρξε error στην GetPayouts", error);
    return false;
  }
};

const ChangePayoutAmount = async ({ payoutId, newAmount }) => {
  "use server";
  try {
    await dbConnect();
    const payout = await Payout.findById(payoutId);
    payout.note = `Το ποσό του payout διορθώθηκε από $${payout.payoutAmount} σε $${newAmount}`;
    payout.payoutAmount = newAmount;
    await payout.save();
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε ένα error στην ChangePayoutAmount", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const AcceptPayoutFunc = async ({ payoutId }) => {
  "use server";
  try {
    await dbConnect();

    // Βρίσκουμε το payout και κάνουμε populate τον user και τους beneficiaries
    const payout = await Payout.findById(payoutId).populate({
      path: "user",
      populate: { path: "beneficiaries.user", model: "User" },
    });

    if (!payout) {
      return { error: true, message: "Το payout δεν βρέθηκε." };
    }

    const { user } = payout;

    if (!user || !user.beneficiaries || user.beneficiaries.length === 0) {
      return { error: true, message: "Ο χρήστης δεν έχει beneficiaries." };
    }

    const totalPayoutAmount = payout.payoutAmount; // Υποθέτω ότι υπάρχει ένα πεδίο `amount` στο payout

    // Διανέμουμε τα κέρδη στους beneficiaries
    for (const beneficiary of user.beneficiaries) {
      const { user: beneficiaryUser, percentage } = beneficiary;

      if (!beneficiaryUser || percentage <= 0) continue; // Αν ο beneficiary δεν έχει ποσοστό, προσπερνάμε

      const amountToAdd = (totalPayoutAmount * percentage) / 100; // Υπολογισμός του ποσού

      // Προσθήκη στα profits του beneficiary
      await User.findByIdAndUpdate(beneficiaryUser._id, {
        $inc: { profits: amountToAdd },
      });

      // Χρήση του ήδη υπάρχοντος leaderId από τον beneficiaryUser
      const leaderId = beneficiaryUser.leader;

      // Δημιουργία νέου τιμολογίου
      const newInvoice = new Invoice({
        user: beneficiaryUser._id,
        leader: leaderId, // Χρησιμοποιούμε το ήδη αποθηκευμένο leader._id
        account: payout.account,
        title: "User Commission Payout",
        description: `Πληρωμή κέρδους από τον χρήστη ${user.firstName} ${user.lastName}`,
        category: "User Commission",
        amount: amountToAdd,
        status: "Pending",
        nextMove: "leader",
      });

      await newInvoice.save();
    }

    payout.status = "Close";
    await payout.save();

    return { error: false, message: "Το payout έγινε αποδεκτό και οι πληρωμές διανεμήθηκαν." };
  } catch (error) {
    console.log("Υπήρξε ένα error στην AcceptPayout", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const Payouts = async () => {
  const payouts = await GetPayouts();
  if (!payouts || payouts.length === 0) return <div className="text-center w-full p-4 animate-pulse">Δεν υπάρχουν payouts</div>;

  return (
    <div className="flex items-center justify-center flex-wrap gap-4">
      {payouts.map((payout) => {
        return (
          <div key={`payout-${payout._id.toString()}`} className="flex flex-col w-full max-w-[350px] gap-1 bg-gray-50 p-4 border border-gray-300 rounded text-gray-500">
            <div className="text-xl text-center font-bold text-gray-700">
              {payout.user.firstName} {payout.user.lastName}
            </div>
            <div className="text-center text-xs">{payout.user.bybitEmail}</div>
            <div className="text-center text-xs">{payout.user.bybitUid}</div>
            <div className="text-sm text-center">
              {payout.leader?.firstName} {payout.leader?.lastName}
            </div>
            <hr className="border-none h-[1px] bg-gray-300 my-2" />
            <div className="flex justify-between text-sm">
              <div>{payout.account.number}</div>
              <div>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(payout.account.balance).replace(",", ".")}</div>
            </div>
            <div className="flex justify-between text-sm">
              <div>{payout.account.company.name}</div>
              <div>{payout.account.timesPaid}</div>
              <div>${payout.account.grossProfit}</div>
            </div>
            <div className="text-center p-4 text-2xl text-gray-700 font-bold">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(payout.payoutAmount).replace(",", ".")}</div>
            <Beneficiaries payoutId={payout._id.toString()} beneficiaries={payout.user.beneficiaries} />
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div>{payout.user.firstName}</div>
                <div>{payout.user.lastName}</div>
              </div>
              <div>{payout.user.share}%</div>
            </div>
            <div className="text-sm text-justify py-2">{payout.report}</div>
            <hr className="border-none h-[1px] bg-gray-300 my-2" />
            <AcceptPayout ChangePayoutAmount={ChangePayoutAmount} AcceptPayoutFunc={AcceptPayoutFunc} payoutId={payout._id.toString()} />
          </div>
        );
      })}
    </div>
  );
};

export default Payouts;
