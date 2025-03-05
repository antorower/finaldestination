import Image from "next/image";
import Link from "next/link";
import UpdateNameForm from "./UpdateNameForm";
import UpdateMaxAccountsForm from "./UpdateMaxAccountsForm";
import UpdateCostFactorForm from "./UpdateCostFactorForm";
import UpdateMaxLotsForm from "./UpdateMaxLotsForm";
import UpdatePhasesForm from "./UpdatePhasesForm";
import dbConnect from "@/dbConnect";
import { revalidatePath } from "next/cache";
import Company from "@/models/Company";

const UpdateName = async ({ companyId, name }) => {
  "use server";
  try {
    await dbConnect();

    await Company.findOneAndUpdate({ _id: companyId }, { $set: { name } });

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε πρόβλημα στο UpdateName", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};
const UpdateMaxAccount = async ({ companyId, maxAccounts }) => {
  "use server";
  try {
    await dbConnect();

    await Company.findOneAndUpdate({ _id: companyId }, { $set: { maxAccounts } });

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε πρόβλημα στο UpdateMaxAccount", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};
const UpdateCostFactor = async ({ companyId, costFactor }) => {
  "use server";
  try {
    await dbConnect();

    await Company.findOneAndUpdate({ _id: companyId }, { $set: { costFactor } }, { new: true });

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε πρόβλημα στο UpdateCostFactor", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};
const UpdateMaxLots = async ({ companyId, maxLots }) => {
  "use server";
  try {
    await dbConnect();

    await Company.findOneAndUpdate({ _id: companyId }, { $set: { maxLots } });

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε πρόβλημα στο UpdateMaxLots", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};
const UpdatePhase1 = async ({ companyId, dailyDrawdown, totalDrawdown, target, maxRiskPerTrade, instructions }) => {
  "use server";
  try {
    await dbConnect();

    await Company.findOneAndUpdate(
      { _id: companyId },
      {
        $set: {
          "phase1.dailyDrawdown": dailyDrawdown,
          "phase1.totalDrawdown": totalDrawdown,
          "phase1.target": target,
          "phase1.maxRiskPerTrade": maxRiskPerTrade,
          "phase1.instructions": instructions,
        },
      },
      { new: true }
    );

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε πρόβλημα στο UpdatePhase1", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};
const UpdatePhase2 = async ({ companyId, dailyDrawdown, totalDrawdown, target, maxRiskPerTrade, instructions }) => {
  "use server";
  try {
    await dbConnect();

    await Company.findOneAndUpdate(
      { _id: companyId },
      {
        $set: {
          "phase2.dailyDrawdown": dailyDrawdown,
          "phase2.totalDrawdown": totalDrawdown,
          "phase2.target": target,
          "phase2.maxRiskPerTrade": maxRiskPerTrade,
          "phase2.instructions": instructions,
        },
      },
      { new: true }
    );

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε πρόβλημα στο UpdatePhase2", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};
const UpdatePhase3 = async ({ companyId, dailyDrawdown, totalDrawdown, target, maxRiskPerTrade, instructions }) => {
  "use server";
  try {
    await dbConnect();

    await Company.findOneAndUpdate(
      { _id: companyId },
      {
        $set: {
          "phase3.dailyDrawdown": dailyDrawdown,
          "phase3.totalDrawdown": totalDrawdown,
          "phase3.target": target,
          "phase3.maxRiskPerTrade": maxRiskPerTrade,
          "phase3.instructions": instructions,
        },
      },
      { new: true }
    );

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε πρόβλημα στο UpdatePhase3", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const CompanyItem = async ({ company, selectedCompany, selectedPhase }) => {
  return (
    <>
      <div className={`p-4 rounded text-white flex flex-col md:flex-row gap-4 justify-between items-center ${company._id.toString() === selectedCompany ? "animate-bounce bg-gray-950" : "bg-indigo-500"}`}>
        <div className="flex gap-2 items-center">
          <Image src="/company.svg" alt="" width={20} height={20} />
          <div className="text-xl font-bold">{company.name}</div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center text-sm">
          <div>Max Accounts: {company.maxAccounts}</div>
          <div>Cost Factor: {company.costFactor}</div>
          <div>Max Lots: {company.maxLots}</div>
        </div>
        <Link href={`/admin/companies?company=${company._id.toString()}`} className="">
          <Image src="/edit.svg" alt="" width={20} height={20} />
        </Link>
      </div>
      {company._id.toString() === selectedCompany && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <UpdateNameForm UpdateName={UpdateName} companyId={selectedCompany} />
            <UpdateMaxAccountsForm UpdateMaxAccount={UpdateMaxAccount} companyId={selectedCompany} />
            <UpdateCostFactorForm UpdateCostFactor={UpdateCostFactor} companyId={selectedCompany} />
            <UpdateMaxLotsForm UpdateMaxLots={UpdateMaxLots} companyId={selectedCompany} />
          </div>
          <div className="grid grid-cols-3">
            <Link href={`/admin/companies?company=${selectedCompany}&phase=1`} className="bg-indigo-400 text-white font-semibold text-sm p-2 border-r border-white flex gap-2 justify-center">
              <div className="hidden sm:block">Phase</div> <div>1</div>
            </Link>
            <Link href={`/admin/companies?company=${selectedCompany}&phase=2`} className="bg-indigo-400 text-white font-semibold text-sm p-2 border-r border-white flex gap-2 justify-center">
              <div className="hidden sm:block">Phase</div> <div>2</div>
            </Link>
            <Link href={`/admin/companies?company=${selectedCompany}&phase=3`} className="bg-indigo-400 text-white font-semibold text-sm p-2 flex gap-2 justify-center">
              <div className="hidden sm:block">Phase</div> <div>3</div>
            </Link>
          </div>
        </div>
      )}
      {company._id.toString() === selectedCompany && selectedPhase && (
        <>
          {selectedPhase === "1" && <UpdatePhasesForm UpdatePhase={UpdatePhase1} companyId={selectedCompany} oldDailyDrawdown={company?.phase1?.dailyDrawdown} oldTotalDrawdown={company?.phase1?.totalDrawdown} oldTarget={company?.phase1?.target} oldMaxRiskPerTrade={company?.phase1?.maxRiskPerTrade} oldInstructions={company?.phase1?.instructions} />}
          {selectedPhase === "2" && <UpdatePhasesForm UpdatePhase={UpdatePhase2} companyId={selectedCompany} oldDailyDrawdown={company?.phase2?.dailyDrawdown} oldTotalDrawdown={company?.phase2?.totalDrawdown} oldTarget={company?.phase2?.target} oldMaxRiskPerTrade={company?.phase2?.maxRiskPerTrade} oldInstructions={company?.phase2?.instructions} />}
          {selectedPhase === "3" && <UpdatePhasesForm UpdatePhase={UpdatePhase3} companyId={selectedCompany} oldDailyDrawdown={company?.phase3?.dailyDrawdown} oldTotalDrawdown={company?.phase3?.totalDrawdown} oldTarget={company?.phase3?.target} oldMaxRiskPerTrade={company?.phase3?.maxRiskPerTrade} oldInstructions={company?.phase3?.instructions} />}
        </>
      )}
    </>
  );
};

export default CompanyItem;
