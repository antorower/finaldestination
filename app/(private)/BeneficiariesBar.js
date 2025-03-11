export const dynamic = "force-dynamic";

const BeneficiariesBar = ({ beneficiaries }) => {
  if (!beneficiaries || beneficiaries.length === 0) return <div>No Beneficiaries</div>;
  return (
    <div className="hidden gap-4 sm:flex items-center px-4 py-2 bg-gray-50 justify-between rounded border border-gray-300 text-gray-600 text-sm">
      <div>Beneficiaries: </div>
      {beneficiaries.map((beneficiary) => {
        return (
          <div key={`beneficiary-list-${beneficiary.user._id.toString()}`}>
            {beneficiary.user.lastName} {beneficiary.user.firstName.slice(0, 3)}. {beneficiary.percentage}%
          </div>
        );
      })}
    </div>
  );
};

export default BeneficiariesBar;
