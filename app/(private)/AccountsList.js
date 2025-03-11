import AccountCard from "./AccountCard";

const AccountsList = ({ accounts, mode }) => {
  if (mode !== "accounts") return null;
  return (
    <>
      <div className="mb-8 justify-center gap-8 hidden md:flex">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
          <div>Phase 1</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-purple-500 rounded-full"></div>
          <div>Phase 2</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-orange-500 rounded-full"></div>
          <div>Funded</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-8 justify-center">{accounts && accounts.length > 0 && accounts.map((account) => <AccountCard key={`list-account-${account._id.toString()}`} account={account} />)}</div>
    </>
  );
};

export default AccountsList;
