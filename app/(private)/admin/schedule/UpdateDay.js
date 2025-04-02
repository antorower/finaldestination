import AddPair from "./AddPair";
import dbConnect from "@/dbConnect";
import { revalidatePath } from "next/cache";
import Settings from "@/models/Settings";
import UpdateDayStringDate from "./UpdateDayStringDate";
import UpdateDayNote from "./UpdateDayNote";
import UpdateDayHours from "./UpdateDayHours";
import UpdateCloseHour from "./UpdateCloseHour";

const AddPairToDay = async ({ day, pairId }) => {
  "use server";
  try {
    await dbConnect();
    const settings = await Settings.findOne();
    if (!settings) {
      return { error: true, message: "Δεν βρέθηκαν settings" };
    }
    await settings.addPairToDay(day, pairId);
    return { error: false };
  } catch (error) {
    console.log("Error στο AddPair στο /admin/UpdateDay", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const UpdateStringDate = async ({ day, stringDate }) => {
  "use server";
  try {
    await dbConnect();
    const settings = await Settings.findOne();
    if (!settings) {
      return { error: true, message: "Δεν βρέθηκαν settings" };
    }
    settings[day].stringDate = stringDate;
    await settings.save();
    return { error: false };
  } catch (error) {
    console.log("Error στο UpdateStringDate στο /admin/UpdateDay", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const UpdateNote = async ({ day, note }) => {
  "use server";
  try {
    await dbConnect();
    const settings = await Settings.findOne();
    if (!settings) {
      return { error: true, message: "Δεν βρέθηκαν settings" };
    }
    settings[day].note = note;
    await settings.save();
    return { error: false };
  } catch (error) {
    console.log("Error στο UpdateNote στο /admin/UpdateDay", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const UpdateHours = async ({ day, startingHour, endingHour }) => {
  "use server";
  try {
    await dbConnect();
    const settings = await Settings.findOne();
    if (!settings) {
      return { error: true, message: "Δεν βρέθηκαν settings" };
    }
    await settings.setDayHours(day, startingHour, endingHour);
    return { error: false };
  } catch (error) {
    console.log("Error στο UpdateDayHours στο /admin/UpdateDay", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const UpdateDayCloseHour = async ({ day, closeHour, closeMinutes }) => {
  "use server";
  try {
    await dbConnect();
    const settings = await Settings.findOne();
    if (!settings) {
      return { error: true, message: "Δεν βρέθηκαν settings" };
    }
    await settings.setCloseHour(day, closeHour, closeMinutes);
    return { error: false };
  } catch (error) {
    console.log("Error στο UpdateDayHours στο /admin/UpdateDay", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const UpdateDay = ({ day, pairs, dayNote, closeHour, closeMinutes, stringDate }) => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-4 justify-center">
        {pairs &&
          pairs.length > 0 &&
          pairs.map((pair) => {
            return <AddPair pairName={pair.name} AddPairToDay={AddPairToDay} pairId={pair._id.toString()} day={day} key={`${day}-pair-to-add-${pair._id.toString()}`} />;
          })}
        {(!pairs || pairs.length === 0) && <div>Δεν υπάρχουν διαθέσιμα pairs</div>}
      </div>
      <div className="flex flex-col lg:flex-row gap-4 m-auto">
        <div className="flex justify-center">
          <UpdateDayStringDate day={day} stringDate={stringDate} UpdateStringDate={UpdateStringDate} />
        </div>
        <div className="flex justify-center">
          <UpdateDayNote day={day} dayNote={dayNote} UpdateNote={UpdateNote} />
        </div>
        <div className="flex justify-center">
          <UpdateDayHours day={day} dayNote={dayNote} UpdateHours={UpdateHours} />
        </div>
        <div className="flex justify-center">
          <UpdateCloseHour day={day} closeHour={closeHour} closeMinutes={closeMinutes} UpdateDayCloseHour={UpdateDayCloseHour} />
        </div>
      </div>
    </div>
  );
};

export default UpdateDay;
