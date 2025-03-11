export const dynamic = "force-dynamic";

const TeamBar = ({ team }) => {
  if (!team || team.length === 0) return <div>No Team</div>;
  return (
    <div className="hidden gap-4 sm:flex items-center px-4 py-2 bg-gray-50 justify-between rounded border border-gray-300 text-gray-600 text-sm">
      <div>Ομάδα:</div>
      {team.map((member) => {
        return (
          <div key={`team-member-list-${member._id.toString()}`}>
            {member.lastName} {member.firstName.slice(0, 3)}.
          </div>
        );
      })}
    </div>
  );
};

export default TeamBar;
