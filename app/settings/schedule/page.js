import Menu from "@/components/Menu";
import dbConnect from "@/dbConnect";
import Settings from "@/models/Settings";
import DayStringDate from "@/components/DayStringDate";
import Link from "next/link";
import Pair from "@/models/Pair";
import DayNote from "@/components/DayNote";

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

const UpdateDayNote = async ({ day, note }) => {
  "use server";
  try {
    dbConnect();
    const settings = await GetSettings();
    settings[day].note = note;
    await settings.save();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const Schedule = async ({ searchParams }) => {
  const params = await searchParams;

  let settings = await GetSettings();
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
      if (settings[day].pairs.some((existingPair) => existingPair._id.toString() === pair)) {
        console.log("Υπάρχει ήδη");
      } else {
        try {
          dbConnect();
          settings[day].pairs.push(pair);
          await settings.save();

          settings = await GetSettings();
        } catch (error) {
          console.log(error);
        }
      }
    }
    if (action === "remove") {
      try {
        dbConnect();
        settings[day].pairs.pull(pair);
        await settings.save();
      } catch (error) {
        console.log(error);
      }
    }
  }
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
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
      <div className="flex gap-4 flex-wrap justify-center">
        {days.map((day) => (
          <div key={day} className="flex flex-col gap-4 border border-gray-700 rounded px-4 py-2 w-[300px]">
            <div className="m-auto capitalize">{day}</div>
            <DayStringDate day={day} UpdateStringDate={UpdateStringDate} />
            <DayNote day={day} UpdateDayNote={UpdateDayNote} />
            <div className="m-auto">{settings[day].stringDate}</div>
            <div className="text-sm text-gray-400 m-auto">{settings[day].note}</div>
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="text-center text-gray-600">Min Hour</div>
              <div className="flex gap-4">
                {[4, 5, 6].map((hour) => (
                  <Link key={`minhour-${day}-${hour}`} href={`/settings/schedule?day=${day}&minhour=${hour}`} className={settings[day].hours.min === hour ? "text-orange-500 font-bold" : " text-white"}>
                    {hour}
                  </Link>
                ))}
              </div>
              <div className="text-center text-gray-600">Max Hour</div>
              <div className="flex gap-4">
                {[9, 10, 11, 12].map((hour) => (
                  <Link key={`maxhour-${day}-${hour}`} href={`/settings/schedule?day=${day}&maxhour=${hour}`} className={settings[day].hours.max === hour ? "text-orange-500 font-bold" : " text-white"}>
                    {hour}
                  </Link>
                ))}
              </div>
              <div className="border border-gray-700 rounded p-4 w-full flex flex-wrap gap-4">
                {settings[day].pairs &&
                  settings[day].pairs.length > 0 &&
                  settings[day].pairs.map((pair, index) => (
                    <Link href={`/settings/schedule?action=remove&day=${day}&pair=${pair._id.toString()}`} key={`${day}-pair-${pair._id.toString()}-${index}`}>
                      {pair.name}
                    </Link>
                  ))}
              </div>
              <div className="flex gap-4">
                {pairs &&
                  pairs
                    .filter((pair) => !settings[day].pairs.some((p) => p._id.toString() === pair._id.toString()))
                    .map((pair) => (
                      <Link href={`/settings/schedule?action=add&day=${day}&pair=${pair._id.toString()}`} key={`pair-${pair._id.toString()}-${day}`} className="flex gap-4 border border-gray-700 px-2 py-1 text-sm">
                        {pair.name}
                      </Link>
                    ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
