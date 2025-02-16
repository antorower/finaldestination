import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Menu from "@/components/Menu";
import AddCompany from "@/components/AddCompany";
import Company from "@/models/Company";
import dbConnect from "@/dbConnect";

const SaveCompany = async (companyData) => {
  "use server";
  try {
    await dbConnect();
    const newCompany = new Company(companyData);
    await newCompany.save();
    return true;
  } catch (error) {
    console.error("Error adding company:", error);
    return false;
  }
};

const GetCompanies = async () => {
  try {
    return await Company.find();
  } catch (error) {}
};

const Companies = async () => {
  const { sessionClaims } = await auth();

  if (!sessionClaims.metadata.owner) {
    redirect("/");
  }
  const companies = await GetCompanies();

  return (
    <div className="flex flex-col gap-4 p-8">
      <Menu activeMenu="Companies" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {companies &&
          companies.length > 0 &&
          companies.map((company) => (
            <div className="border flex flex-col gap-2 border-gray-700 p-4" key={`company-${company.name}`}>
              <a href={company.link} target="_blank" className="border-b border-gray-700 pb-2">
                {company.name}
              </a>
              <div className="border border-gray-700 p-4 my-2 flex flex-col gap-2">
                <div className="flex justify-between">
                  <div>Max Accounts </div>
                  <div>{company.maxAccounts}</div>
                </div>
                <div className="flex justify-between">
                  <div>Commission Factor </div>
                  <div> {company.commissionFactor}</div>
                </div>
                <div className="flex justify-between">
                  <div>Phases </div>
                  <div> {company.phases.length}</div>
                </div>
              </div>
              {company.phases[0] && (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <div>Phase</div>
                    <div>{company.phases[0].name}</div>
                  </div>
                  <div className="flex justify-between">
                    <div>Daily Drawdown</div>
                    <div>{company.phases[0].dailyDrawdown}%</div>
                  </div>
                  <div className="flex justify-between">
                    <div>Total Drawdown</div>
                    <div>{company.phases[0].totalDrawdown}%</div>
                  </div>
                  <div className="flex justify-between">
                    <div>Target</div>
                    <div>{company.phases[0].target}%</div>
                  </div>
                  <div className="flex justify-between">
                    <div>Max Risk</div>
                    <div>{company.phases[0].maxRiskPerTrade}%</div>
                  </div>
                  <div className="border border-gray-700 p-4">{company.phases[0].instructions}</div>
                </div>
              )}

              {company.phases[1] && (
                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <div>Phase</div>
                    <div>{company.phases[1].name}</div>
                  </div>
                  <div className="flex justify-between">
                    <div>Daily Drawdown</div>
                    <div>{company.phases[1].dailyDrawdown}%</div>
                  </div>
                  <div className="flex justify-between">
                    <div>Total Drawdown</div>
                    <div>{company.phases[1].totalDrawdown}%</div>
                  </div>
                  <div className="flex justify-between">
                    <div>Target</div>
                    <div>{company.phases[1].target}%</div>
                  </div>
                  <div className="flex justify-between">
                    <div>Max Risk</div>
                    <div>{company.phases[1].maxRiskPerTrade}%</div>
                  </div>
                  <div className="border border-gray-700 p-4">{company.phases[1].instructions}</div>
                </div>
              )}

              {company.phases[2] && (
                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <div>Phase</div>
                    <div>{company.phases[2].name}</div>
                  </div>
                  <div className="flex justify-between">
                    <div>Daily Drawdown</div>
                    <div>{company.phases[2].dailyDrawdown}%</div>
                  </div>
                  <div className="flex justify-between">
                    <div>Total Drawdown</div>
                    <div>{company.phases[2].totalDrawdown}%</div>
                  </div>
                  <div className="flex justify-between">
                    <div>Target</div>
                    <div>{company.phases[2].target}%</div>
                  </div>
                  <div className="flex justify-between">
                    <div>Max Risk</div>
                    <div>{company.phases[2].maxRiskPerTrade}%</div>
                  </div>
                  <div className="border border-gray-700 p-4">{company.phases[2].instructions}</div>
                </div>
              )}
            </div>
          ))}
        <div className="">
          <AddCompany SaveCompany={SaveCompany} />
        </div>
      </div>
    </div>
  );
};

export default Companies;
