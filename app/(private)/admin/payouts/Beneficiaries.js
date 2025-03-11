const Beneficiaries = ({ beneficiaries, payoutId }) => {
  return (
    <div className="flex flex-col gap-2">
      {beneficiaries.map((beneficiary, index) => {
        return (
          <div key={`${payoutId}-${beneficiary.user._id.toString()}-${index}`} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div>{beneficiary.user.firstName}</div>
              <div>{beneficiary.user.lastName}</div>
            </div>
            <div>{beneficiary.percentage}%</div>
          </div>
        );
      })}
    </div>
  );
};

export default Beneficiaries;
