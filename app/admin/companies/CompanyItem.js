import Image from "next/image";
import Link from "next/link";
import UpdateNameForm from "./UpdateNameForm";
import dbConnect from "@/dbConnect";
import { revalidatePath } from "next/cache";
import Company from "@/models/Company";

const UpdateName = async ({ companyId, name }) => {
  "use server";
  try {
    await dbConnect();

    await Company.findOneAndUpdate({ _id: companyId }, { $set: { name } }, { new: true });

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

    await Company.findOneAndUpdate({ _id: companyId }, { $set: { maxAccounts } }, { new: true });

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε πρόβλημα στο UpdateMaxAccount", error);
    return { error: true, message: error.message };
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
  }
};
const UpdateMaxLots = async ({ companyId, maxLots }) => {
  "use server";
  try {
    await dbConnect();

    await Company.findOneAndUpdate({ _id: companyId }, { $set: { maxLots } }, { new: true });

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε πρόβλημα στο UpdateMaxLots", error);
    return { error: true, message: error.message };
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
          "phases1.dailyDrawdown": dailyDrawdown,
          "phases1.totalDrawdown": totalDrawdown,
          "phases1.target": target,
          "phases1.maxRiskPerTrade": maxRiskPerTrade,
          "phases1.instructions": instructions,
        },
      },
      { new: true }
    );

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε πρόβλημα στο UpdatePhase1", error);
    return { error: true, message: error.message };
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
          "phases2.dailyDrawdown": dailyDrawdown,
          "phases2.totalDrawdown": totalDrawdown,
          "phases2.target": target,
          "phases2.maxRiskPerTrade": maxRiskPerTrade,
          "phases2.instructions": instructions,
        },
      },
      { new: true }
    );

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε πρόβλημα στο UpdatePhase2", error);
    return { error: true, message: error.message };
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
          "phases3.dailyDrawdown": dailyDrawdown,
          "phases3.totalDrawdown": totalDrawdown,
          "phases3.target": target,
          "phases3.maxRiskPerTrade": maxRiskPerTrade,
          "phases3.instructions": instructions,
        },
      },
      { new: true }
    );

    return { error: false };
  } catch (error) {
    console.log("Υπήρξε πρόβλημα στο UpdatePhase3", error);
    return { error: true, message: error.message };
  }
};

const CompanyItem = async ({ company, selectedCompany, selectedPhase, searchParams }) => {
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
          <div className="grid grid-cols-4 gap-8">
            <UpdateNameForm UpdateName={UpdateName} companyId={selectedCompany} />
            <UpdateNameForm UpdateName={UpdateName} companyId={selectedCompany} />
            <UpdateNameForm UpdateName={UpdateName} companyId={selectedCompany} />
            <UpdateNameForm UpdateName={UpdateName} companyId={selectedCompany} />
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
      {company._id.toString() === selectedCompany && selectedPhase && <div>{selectedPhase}</div>}
    </>
  );
};

export default CompanyItem;
