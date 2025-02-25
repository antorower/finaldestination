import dbConnect from "@/dbConnect";
import Settings from "@/models/Settings";
import TradingHoursForm from "./TradingHoursForm";
import UpdateBalanceHoursForm from "./UpdateBalanceHoursForm";
import AcceptTradesHoursForm from "./AcceptTradesHoursForm";
import SeeScheduleHoursForm from "./SeeScheduleHoursForm";
import SpaceBetweenTradesForm from "./SpaceBetweenTradesForm";
import SpaceForPresenceForm from "./SpaceForPresenceForm";
import TargetsGapForm from "./TargetsGapForm";
import { revalidatePath } from "next/cache";
import PageTransition from "@/components/PageTransition";

const GetSettings = async () => {
  "use server";
  try {
    return await Settings.findOne();
  } catch (error) {
    console.log("Υπήρξε error στην GetSettings στο /admin/settings", error);
    return false;
  }
};

const UpdateTradingHours = async ({ startingHour, endingHour }) => {
  "use server";
  try {
    await dbConnect();
    const settings = await Settings.findOne().select("_id");
    settings.tradingHours.startingHour = startingHour;
    settings.tradingHours.endingHour = endingHour;
    await settings.save();
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην UpdateTradingHours στο /admin/settings", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const UpdateBalanceHours = async ({ startingHour, endingHour }) => {
  "use server";
  try {
    await dbConnect();
    const settings = await Settings.findOne().select("_id");
    settings.updateBalanceHours.startingHour = startingHour;
    settings.updateBalanceHours.endingHour = endingHour;
    await settings.save();
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην UpdateTradingHours στο /admin/settings", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const UpdateAcceptTradesHours = async ({ startingHour, endingHour }) => {
  "use server";
  try {
    await dbConnect();
    const settings = await Settings.findOne().select("_id");
    settings.acceptTradesHours.startingHour = startingHour;
    settings.acceptTradesHours.endingHour = endingHour;
    await settings.save();
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην UpdateAcceptTradesHours στο /admin/settings", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const UpdateSeeScheduleHours = async ({ startingHour, endingHour }) => {
  "use server";
  try {
    await dbConnect();
    const settings = await Settings.findOne().select("_id");
    settings.seeScheduleHours.startingHour = startingHour;
    settings.seeScheduleHours.endingHour = endingHour;
    await settings.save();
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην UpdateSeeScheduleHours στο /admin/settings", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const UpdateMinutesSpaceBetweenTrades = async ({ minutes }) => {
  "use server";
  try {
    await dbConnect();
    const settings = await Settings.findOne().select("_id");
    settings.minutesSpaceBetweenTrades = minutes;
    await settings.save();
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην UpdateMinutesSpaceBetweenTrades στο /admin/settings", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const UpdateMinutesSpaceForPresenceBeforeTrades = async ({ minutes }) => {
  "use server";
  try {
    await dbConnect();
    const settings = await Settings.findOne().select("_id");
    settings.minutesSpaceForPresenceBeforeTrade = minutes;
    await settings.save();
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην UpdateMinutesSpaceForPresenceBeforeTrades στο /admin/settings", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const UpdateTargetsGap = async ({ phase1, phase2, phase3 }) => {
  "use server";
  try {
    await dbConnect();
    const settings = await Settings.findOne().select("_id");
    settings.targetsGap.phase1 = phase1;
    settings.targetsGap.phase2 = phase2;
    settings.targetsGap.phase3 = phase3;
    await settings.save();
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην UpdateTargetGaps στο /admin/settings", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const SettingsPage = async () => {
  const settingsObj = await GetSettings();
  return (
    <PageTransition>
      <div className="flex flex-col gap-4">
        <div className="text-center bg-blue-500 rounded p-4 text-white font-bold border border-gray-500">Τακτικό Πρόγραμμα</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <TradingHoursForm UpdateTradingHours={UpdateTradingHours} currentStartingHour={settingsObj.tradingHours.startingHour} currentEndingHour={settingsObj.tradingHours.endingHour} />
          <UpdateBalanceHoursForm UpdateBalanceHours={UpdateBalanceHours} currentStartingHour={settingsObj.updateBalanceHours.startingHour} currentEndingHour={settingsObj.updateBalanceHours.endingHour} />
          <AcceptTradesHoursForm UpdateAcceptTradesHours={UpdateAcceptTradesHours} currentStartingHour={settingsObj.acceptTradesHours.startingHour} currentEndingHour={settingsObj.acceptTradesHours.endingHour} />
          <SeeScheduleHoursForm UpdateSeeScheduleHours={UpdateSeeScheduleHours} currentStartingHour={settingsObj.seeScheduleHours.startingHour} currentEndingHour={settingsObj.seeScheduleHours.endingHour} />
        </div>
        <div className="text-center bg-blue-500 rounded p-4 text-white font-bold border border-gray-500">Ρυθμίσεις Trades</div>
        <div className="flex flex-wrap gap-2 justify-center">
          <SpaceBetweenTradesForm UpdateMinutesSpaceBetweenTrades={UpdateMinutesSpaceBetweenTrades} currentMinutes={settingsObj.minutesSpaceBetweenTrades} />
          <SpaceForPresenceForm UpdateMinutesSpaceForPresenceBeforeTrades={UpdateMinutesSpaceForPresenceBeforeTrades} currentMinutes={settingsObj.minutesSpaceForPresenceBeforeTrade} />
          <TargetsGapForm UpdateTargetsGap={UpdateTargetsGap} oldPhase1={settingsObj.targetsGap.phase1} oldPhase2={settingsObj.targetsGap.phase2} oldPhase3={settingsObj.targetsGap.phase3} />
        </div>
      </div>
    </PageTransition>
  );
};

export default SettingsPage;
