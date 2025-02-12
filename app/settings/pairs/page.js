import Pair from "@/models/Pair";
import dbConnect from "@/dbConnect";
import Menu from "@/components/Menu";
import AddPairForm from "@/components/AddPairForm";
import Link from "next/link";

const GetPairs = async () => {
  "use server";
  try {
    dbConnect();
    return await Pair.find().sort({ priority: -1 });
  } catch (error) {
    return false;
  }
};

const SaveNewPair = async ({ name, minLots, maxLots, priority }) => {
  "use server";
  try {
    dbConnect();
    const newPair = new Pair({ name: name, lots: { fast: maxLots, slow: minLots }, priority: priority });
    await newPair.save();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const Pairs = async () => {
  const pairs = await GetPairs();

  return (
    <div className="flex flex-col gap-4 p-8">
      <Menu activeMenu="Settings" />
      <div className="flex justify-center gap-8">
        <Link href="/settings/pairs" className="hover:text-orange-300">
          Pairs
        </Link>
        <Link href="/settings/schedule" className="hover:text-orange-300">
          Schedule
        </Link>
      </div>
      <div className="flex gap-4 justify-center">
        {pairs &&
          pairs.length > 0 &&
          pairs.map((pair) => {
            return (
              <div key={`pair-${pair.name}`} className="border border-gray-700 rounded px-4 py-2 flex gap-4">
                <div>({pair.priority})</div>
                <div>{pair.name}</div>
                <div>{pair.lots.slow} lots</div>
                <div>-</div>
                <div>{pair.lots.fast} lots</div>
              </div>
            );
          })}
      </div>
      <div className="m-auto">
        <AddPairForm SaveNewPair={SaveNewPair} />
      </div>
    </div>
  );
};

export default Pairs;
