export const dynamic = "force-dynamic";

import dbConnect from "@/dbConnect";
import CreateCompany from "./CreateCompany";
import Company from "@/models/Company";
import CompanyItem from "./CompanyItem";
import { revalidatePath } from "next/cache";
import NewCompanyButton from "./NewCompanyButton";
import PageTransition from "@/components/PageTransition";

const CreateNewCompany = async ({ name, maxAccounts, costFactor, maxLots }) => {
  "use server";
  try {
    await dbConnect();
    const newCompany = new Company({ name, maxAccounts, costFactor, maxLots });
    await newCompany.save();
    return { error: false };
  } catch (error) {
    console.log("Υπήρξε error στην CreateNewCompany στο /admin/companies", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};

const GetCompanies = async () => {
  "use server";
  try {
    await dbConnect();
    return await Company.find();
  } catch (error) {
    console.log(error);
    return false;
  }
};

const Companies = async ({ searchParams }) => {
  const companies = await GetCompanies();
  const { mode, company, phase } = await searchParams;

  return (
    <PageTransition>
      <div className="flex flex-col gap-8">
        {companies && companies.length > 0 && (
          <div className="flex flex-col gap-4">
            {companies.map((companyItem) => {
              return <CompanyItem selectedCompany={company} selectedPhase={phase} key={`company-${companyItem._id.toString()}`} company={companyItem} />;
            })}
          </div>
        )}
        {mode === "new" && <CreateCompany CreateNewCompany={CreateNewCompany} />}
        <NewCompanyButton />
      </div>
    </PageTransition>
  );
};

export default Companies;
