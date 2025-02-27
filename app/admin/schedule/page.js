export const dynamic = "force-dynamic";

import dbConnect from "@/dbConnect";
import Settings from "@/models/Settings";
import Pair from "@/models/Pair";
import Link from "next/link";
import ActivateDayButton from "./ActivateDayButton";
import { revalidatePath } from "next/cache";
import ResetScheduleButton from "./ResetScheduleButton";
import PageTransition from "@/components/PageTransition";
import RemovePair from "./RemovePair";
import UpdateDay from "./UpdateDay";

const GetSchedule = async () => {
  "use server";
  try {
    await dbConnect();
    const settings = await Settings.findOne().select("monday tuesday wednesday thursday friday").populate("monday.pairs").populate("tuesday.pairs").populate("wednesday.pairs").populate("thursday.pairs").populate("friday.pairs");
    if (!settings) {
      const newSettings = new Settings({});
      await newSettings.save();
      return newSettings;
    }
    return settings;
  } catch (error) {
    console.log("Υπήρξε ένα error στην GetSchedule στο /admin/schedule", error);
    return { error: true, message: error.message };
  }
};

const GetActivePairs = async () => {
  "use server";
  try {
    await dbConnect();
    return await Pair.find({ active: true }).select("name");
  } catch (error) {
    console.log("Υπήρξε error στην GetActivePairs στο /admin/schedule", error);
    return false;
  }
};

const ActivateDay = async (day) => {
  "use server";
  try {
    await dbConnect();
    const settings = await Settings.findOne().select(`${day}`);
    settings[day].active = !settings[day].active;
    await settings.save();
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην ActivateDay στο /admin/shedule", error);
    return { erorr: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const ResetSchedule = async () => {
  "use server";
  try {
    await dbConnect();

    await Settings.updateOne(
      {},
      {
        $set: {
          "monday.stringDate": "",
          "monday.pairs": [],
          "monday.hours.min": new Date(),
          "monday.hours.max": new Date(),
          "monday.note": "",
          "monday.active": false,

          "tuesday.stringDate": "",
          "tuesday.pairs": [],
          "tuesday.hours.min": new Date(),
          "tuesday.hours.max": new Date(),
          "tuesday.note": "",
          "tuesday.active": false,

          "wednesday.stringDate": "",
          "wednesday.pairs": [],
          "wednesday.hours.min": new Date(),
          "wednesday.hours.max": new Date(),
          "wednesday.note": "",
          "wednesday.active": false,

          "thursday.stringDate": "",
          "thursday.pairs": [],
          "thursday.hours.min": new Date(),
          "thursday.hours.max": new Date(),
          "thursday.note": "",
          "thursday.active": false,

          "friday.stringDate": "",
          "friday.pairs": [],
          "friday.hours.min": new Date(),
          "friday.hours.max": new Date(),
          "friday.note": "",
          "friday.active": false,
        },
      }
    );

    return { error: false };
  } catch (error) {
    console.error("Error στο ResetSchedule στο /admin/schedule", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const RemovePairFromDay = async ({ day, pairId }) => {
  "use server";
  try {
    await dbConnect();
    const settings = await Settings.findOne();
    if (!settings) {
      return { error: true, message: "Δεν βρέθηκαν settings" };
    }
    await settings.removePairFromDay(day, pairId);
    return { error: false };
  } catch (error) {
    console.log("Error στο AddPair στο /admin/shedule", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const Schedule = async ({ searchParams }) => {
  const { day } = await searchParams;

  const settings = await GetSchedule();
  const pairs = await GetActivePairs();
  console.log(settings);

  console.log(pairs);
  return (
    <PageTransition>
      <div className="flex flex-col gap-4 w-full">
        <ResetScheduleButton ResetSchedule={ResetSchedule} />
        <Day startingDate={settings.monday.hours.min} endingDate={settings.monday.hours.max} data={settings.monday} text="Δευτέρα" day="monday" />
        {day === "monday" && <UpdateDay dayNote={settings[day].note} stringDate={settings[day].stringDate} string pairs={pairs} day={day} />}
        <Day startingDate={settings.tuesday.hours.min} endingDate={settings.tuesday.hours.max} data={settings.tuesday} text="Τρίτη" day="tuesday" />
        {day === "tuesday" && <UpdateDay dayNote={settings[day].note} stringDate={settings[day].stringDate} pairs={pairs} day={day} />}
        <Day startingDate={settings.wednesday.hours.min} endingDate={settings.wednesday.hours.max} data={settings.wednesday} text="Τετάρτη" day="wednesday" />
        {day === "wednesday" && <UpdateDay dayNote={settings[day].note} stringDate={settings[day].stringDate} pairs={pairs} day={day} />}
        <Day startingDate={settings.thursday.hours.min} endingDate={settings.thursday.hours.max} data={settings.thursday} text="Πέμπτη" day="thursday" />
        {day === "thursday" && <UpdateDay dayNote={settings[day].note} stringDate={settings[day].stringDate} pairs={pairs} day={day} />}
        <Day startingDate={settings.friday.hours.min} endingDate={settings.friday.hours.max} data={settings.friday} text="Παρασκευή" day="friday" />
        {day === "friday" && <UpdateDay dayNote={settings[day].note} stringDate={settings[day].stringDate} pairs={pairs} day={day} />}
      </div>
    </PageTransition>
  );
};

export default Schedule;

const Day = ({ data, text, day, startingDate, endingDate }) => {
  return (
    <div className={`p-4 rounded flex flex-col gap-4 lg:flex-row justify-between items-center text-white transition-all duration-500 ${data.active ? "bg-blue-500" : "bg-rose-300"}`}>
      <div className="flex flex-col items-center lg:items-start justify-center gap-2">
        <Link href={`/admin/schedule?day=${day}`} className="font-semibold text-xl text-center">
          {data.stringDate || text}
        </Link>
        <div className="text-sm text-center">{data.note || "Δεν υπάρχει note"}</div>
      </div>
      <div className="flex flex-col gap-2 text-lg font-semibold">
        <DateDisplay date={startingDate} />
        <DateDisplay date={endingDate} />
      </div>
      <div className="flex flex-wrap gap-4 items-center justify-center">
        {data.pairs &&
          data.pairs.length > 0 &&
          data.pairs.map((pair) => {
            return (
              <RemovePair pairName={pair.name} RemovePairFromDay={RemovePairFromDay} pairId={pair._id.toString()} day={day} key={`pair-on-${day}-${pair._id.toString()}`}>
                {pair.name}
              </RemovePair>
            );
          })}
        {(!data.pairs || data.pairs.length === 0) && <div className="animate-pulse">Δεν υπάρχουν pairs</div>}
      </div>
      <ActivateDayButton day={day} active={data.active} ActivateDay={ActivateDay} />
    </div>
  );
};

const formatDateToGreek = (utcDate) => {
  if (!utcDate) return "—"; // Αν δεν υπάρχει ημερομηνία, εμφανίζει παύλα

  return new Date(utcDate).toLocaleString("el-GR", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Χρήση 24ωρης μορφής
  });
};

const DateDisplay = ({ date }) => {
  return (
    <div className="flex gap-2 items-center">
      <div>🕛 </div>
      <div>{formatDateToGreek(date)}</div>
    </div>
  );
};
