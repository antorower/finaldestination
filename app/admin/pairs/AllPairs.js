import dbConnect from "@/dbConnect";
import Pair from "@/models/Pair";
import ActivatePair from "./ActivatePair";
import { revalidatePath } from "next/cache";
import Link from "next/link";

const GetPairs = async () => {
  "use server";
  try {
    await dbConnect();
    return await Pair.find().sort({ active: -1, priority: 1 });
  } catch (error) {
    console.log("Υπήρξε πρόβλημα στην GetPairs στο /admin/pairs", error);
    return false;
  }
};

const ChangeStatus = async ({ pairId, active }) => {
  "use server";
  try {
    await dbConnect();
    await Pair.findByIdAndUpdate(pairId, { $set: { active: !active } });
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην ChangeStatus στο /admin/pairs/AllPairs", error);
    return { error: true, message: erorr.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const AllPairs = async () => {
  const pairs = await GetPairs();
  if (!pairs || pairs.length === 0) return <div className="w-full text-center text-gray-700 animate-pulse">Δεν υπάρχουν pairs</div>;
  return (
    <div className="flex gap-4 flex-wrap justify-center">
      {pairs.map((pair) => {
        return (
          <div key={`pair-${pair._id.toString()}`} className={`p-4 flex gap-4 items-center border ${pair.active ? "border-blue-200 bg-blue-50" : "border-red-200 bg-red-50"} rounded`}>
            <div className="flex gap-4">
              <div>{pair.priority}</div>
              <Link href={`/admin/pairs?name=${pair.name}&lots=${pair.lots}&priority=${pair.priority}&costFactor=${pair.costFactor}`} className={`font-bold ${pair.active ? "text-blue-700" : "text-red-700"}`}>
                {pair.name}
              </Link>
            </div>
            <div className="text-gray-500">Lots: {pair.lots}</div>
            <div className="text-gray-500">Cost: {pair.costFactor}</div>
            <ActivatePair pairId={pair._id.toString()} active={pair.active} ChangeStatus={ChangeStatus} />
          </div>
        );
      })}
    </div>
  );
};

export default AllPairs;
