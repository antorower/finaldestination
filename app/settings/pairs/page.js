import Pair from "@/models/Pair";
import dbConnect from "@/dbConnect";
import Menu from "@/components/Menu";
import AddPairForm from "@/components/AddPairForm";

const GetPairs = async () => {
  "use server";
  try {
    dbConnect();
    return await Pair.find();
  } catch (error) {
    return false;
  }
};

const SaveNewPair = async ({ name, minLots, maxLots }) => {
  "use server";
  try {
    dbConnect();
    const newPair = new Pair({ name: name, lots: { fast: maxLots, slow: minLots } });
    await newPair.save();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const Pairs = async () => {
  const pairs = await GetPairs();
  console.log(pairs);
  return (
    <div className="flex flex-col gap-4 p-8">
      <Menu activeMenu="Settings" />
      <div className="flex gap-4">
        {pairs &&
          pairs.length > 0 &&
          pairs.map((pair) => {
            return (
              <div key={`pair-${pair.name}`} className="border border-gray-700 rounded px-4 py-2 flex gap-4">
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
