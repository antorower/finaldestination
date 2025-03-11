export const dynamic = "force-dynamic";

import InfoButton from "@/components/InfoButton";

const LeaderFamilyBar = ({ leader, family }) => {
  return (
    <div className="flex items-center px-4 py-2 bg-gray-50 justify-between rounded border border-gray-300 text-gray-600 text-sm">
      <div>
        Team: <span className="font-bold">{leader ? leader : "-"}</span>
      </div>
      <div>
        Family: <span className="font-bold">{family ? family : "-"}</span>
      </div>
    </div>
  );
};

export default LeaderFamilyBar;
