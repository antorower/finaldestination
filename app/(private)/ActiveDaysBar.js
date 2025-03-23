const ActiveDaysBar = ({ mon, tue, wed, thu, fri }) => {
  return (
    <div className="flex font-bold items-center gap-4 px-4 py-2 bg-gray-50 justify-center rounded border border-gray-300 text-gray-600 text-sm">
      <Day day="ΔΕΥ" active={mon} />
      <Day day="ΤΡΙ" active={mon} />
      <Day day="ΤΕΤ" active={mon} />
      <Day day="ΠΕΜ" active={mon} />
      <Day day="ΠΑΡ" active={mon} />
    </div>
  );
};

export default ActiveDaysBar;

const Day = ({ day, active }) => {
  return <div className={active ? "text-blue-500" : "text-black opacity-25"}>{day}</div>;
};
