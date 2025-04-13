const ActiveDaysBar = ({ mon, tue, wed, thu, fri, settings, hourOffsetFromGreece }) => {
  if (!mon && !tue && !wed && !thu && !fri) {
    return <div className="flex font-bold items-center gap-4 px-4 py-2 bg-gray-50 justify-center rounded border border-gray-300 text-gray-400 text-sm">Το πρόγραμμα της επόμενης βδομάδας δεν είναι ακόμα έτοιμο</div>;
  }
  return (
    <div className="flex font-bold items-center gap-4 px-4 py-2 bg-gray-50 justify-center rounded border border-gray-300 text-gray-600 text-sm">
      <Day day="ΔΕΥ" active={mon} settings={settings.monday} hourOffsetFromGreece={hourOffsetFromGreece} />
      <Day day="ΤΡΙ" active={tue} settings={settings.tuesday} hourOffsetFromGreece={hourOffsetFromGreece} />
      <Day day="ΤΕΤ" active={wed} settings={settings.wednesday} hourOffsetFromGreece={hourOffsetFromGreece} />
      <Day day="ΠΕΜ" active={thu} settings={settings.thursday} hourOffsetFromGreece={hourOffsetFromGreece} />
      <Day day="ΠΑΡ" active={fri} settings={settings.friday} hourOffsetFromGreece={hourOffsetFromGreece} />
    </div>
  );
};

export default ActiveDaysBar;

const Day = ({ day, active, settings, hourOffsetFromGreece }) => {
  let closeHour = settings.closeHour.hour + hourOffsetFromGreece;
  let closeMinute = settings.closeHour.minutes;
  if (closeHour === 0) closeHour = 12;
  if (closeHour === -1) closeHour = 11;
  if (closeHour === -2) closeHour = 10;
  if (closeHour === -3) closeHour = 9;

  return (
    <div className={`flex flex-col items-center justify-center ${active ? "text-blue-500" : "text-black opacity-25"}`}>
      <div>{day}</div>
      {active && (
        <div>
          {closeHour}:{closeMinute}
        </div>
      )}
    </div>
  );
};
