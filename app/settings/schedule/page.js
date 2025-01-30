import Menu from "@/components/Menu";
import dbConnect from "@/dbConnect";
import Settings from "@/models/Settings";
import DayStringDate from "@/components/DayStringDate";
import Link from "next/link";
import Pair from "@/models/Pair";

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

const UpdateStringDate = async ({ day, stringDate }) => {
  "use server";
  try {
    dbConnect();
    const settings = await GetSettings();
    settings[day].stringDate = stringDate;
    await settings.save();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
const UpdateMode = ({ day, mode }) => {};
const UpdateMaxHour = ({ day, maxHour }) => {};
const UpdateMinHour = ({ day, minHour }) => {};
const AddPair = ({ day, pairId }) => {};
const RemovePair = ({ day, pairId }) => {};

const Schedule = async ({ searchParams }) => {
  const params = await searchParams;

  const settings = await GetSettings();
  const pairs = await GetPairs();

  const pair = params.pair;
  const action = params.action;
  const day = params.day;
  const minHour = params.minhour;
  const maxHour = params.maxhour;

  if (minHour) {
    try {
      dbConnect();
      settings[day].hours.min = Number(minHour);
      await settings.save();
    } catch (error) {
      console.log(error);
    }
  }

  if (maxHour) {
    try {
      dbConnect();
      settings[day].hours.max = Number(maxHour);
      await settings.save();
    } catch (error) {
      console.log(error);
    }
  }

  if (pair && action && day) {
    if (action === "add") {
      try {
        dbConnect();
        settings[day].pairs.push(pair);
        await settings.save();
        redirect("/settings/schedule");
      } catch (error) {
        console.log(error);
      }
    }
    if (action === "remove") {
      try {
        dbConnect();
        settings[day].pairs.pull(pair);
        await settings.save();
        redirect("/settings/schedule");
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 p-8">
      <Menu activeMenu="Settings" />
      <div className="flex gap-4">
        <div className="flex flex-col gap-4 border border-gray-700 rounded px-4 py-2">
          <div className="m-auto">Monday</div>
          <DayStringDate day="monday" UpdateStringDate={UpdateStringDate} />
          <div className="m-auto">{settings.monday.stringDate}</div>
          <div className="flex flex-col items-center justify-center gap-4">
            <div>Min Hour</div>
            <div className="flex gap-4">
              <Link href={`/settings/schedule?day=monday&minhour=4`} className={settings.monday.hours.min === 4 ? "text-orange-500 font-bold" : " text-white"}>
                4
              </Link>
              <Link href={`/settings/schedule?day=monday&minhour=5`} className={settings.monday.hours.min === 5 ? "text-orange-500 font-bold" : " text-white"}>
                5
              </Link>
              <Link href={`/settings/schedule?day=monday&minhour=6`} className={settings.monday.hours.min === 6 ? "text-orange-500 font-bold" : " text-white"}>
                6
              </Link>
            </div>
            <div>Max Hour</div>
            <div className="flex gap-4">
              <Link href={`/settings/schedule?day=monday&maxhour=9`} className={settings.monday.hours.max === 9 ? "text-orange-500 font-bold" : " text-white"}>
                9
              </Link>
              <Link href={`/settings/schedule?day=monday&maxhour=10`} className={settings.monday.hours.max === 10 ? "text-orange-500 font-bold" : " text-white"}>
                10
              </Link>
              <Link href={`/settings/schedule?day=monday&maxhour=11`} className={settings.monday.hours.max === 11 ? "text-orange-500 font-bold" : " text-white"}>
                11
              </Link>
              <Link href={`/settings/schedule?day=monday&maxhour=12`} className={settings.monday.hours.max === 12 ? "text-orange-500 font-bold" : " text-white"}>
                12
              </Link>
            </div>
            <div className="border border-gray-700 rounded p-4 w-full">
              {settings.monday.pairs &&
                settings.monday.pairs.length > 0 &&
                settings.monday.pairs.map((pair, index) => {
                  console.log("Pair", pair._id);
                  return <div key={`monday-pair-${pair._id.toString()}-${index}`}>{pair.name}</div>;
                })}
            </div>
            <div>
              {pairs &&
                pairs.length > 0 &&
                pairs.map((pair) => {
                  return (
                    <div key={`pair-${pair._id.toString()}`} className="flex gap-4 border border-gray-700 px-2 py-1 text-sm">
                      <div>{pair.name}</div>
                      <Link href={`/settings/schedule?action=add&day=monday&pair=${pair._id.toString()}`}>+</Link>
                      <Link href={`/settings/schedule?action=remove&day=monday&pair=${pair._id.toString()}`}>-</Link>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
