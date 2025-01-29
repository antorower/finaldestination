import Menu from "@/components/Menu";
import dbConnect from "@/dbConnect";
import Settings from "@/models/Settings";

const GetSettings = async () => {
  "use server";
  await dbConnect();
  try {
    const settings = await Settings.findOne().populate("monday.pairs tuesday.pairs wednesday.pairs thursday.pairs friday.pairs");
    if (!settings) {
      const newSettings = new Settings({});
      await newSettings.save();
      return newSettings;
    }
    return settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return false;
  }
};

const GetPairs = async () => {
  "use server";
  try {
    dbConnect();
    return await Pair.find();
  } catch (error) {
    return false;
  }
};

const UpdateStringDate = ({ day, stringDate }) => {};
const UpdateMode = () => {
  {
    day, mode;
  }
};
const UpdateMaxHour = ({ day, maxHour }) => {};
const UpdateMinHour = ({ day, minHour }) => {};
const AddPair = ({ day, pairId }) => {};
const RemovePair = ({ day, pairId }) => {};

const Schedule = async ({ searchParams }) => {
  const params = await searchParams;

  const settings = await GetSettings();
  const pairs = await GetPairs();

  const action = params.action;
  const pair = params.pair;
  const day = params.day;
  const minHour = params.minhour;
  const maxHour = params.maxhour;

  return (
    <div className="flex flex-col gap-4 p-8">
      <Menu activeMenu="Settings" />
      <div className="flex gap-4">
        <div className="flex flex-col gap-4 border border-gray-700 rounded px-4 py-2">
          <div className="m-auto">Monday</div>
          <div className="flex flex-col items-center justify-center gap-4">
            <div>Min Hour</div>
            <div className="flex gap-4">
              <div>4</div>
              <div>5</div>
              <div>6</div>
            </div>
            <div>Max Hour</div>
            <div className="flex gap-4">
              <div>8</div>
              <div>9</div>
              <div>10</div>
              <div>11</div>
              <div>12</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
