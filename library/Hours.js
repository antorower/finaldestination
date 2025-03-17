export const ConvertToUserTime = (utcDateString, minutesToAdd) => {
  console.log(minutesToAdd);
  // Δημιουργία Date αντικειμένου από το UTC string
  const utcDate = new Date(utcDateString);
  console.log(utcDate);

  // Προσθήκη λεπτών
  utcDate.setMinutes(utcDate.getMinutes() + minutesToAdd);
  console.log(utcDate);
  // Δημιουργία ημερομηνίας στη ζώνη ώρας Ελλάδας
  const formattedDate = new Intl.DateTimeFormat("el-GR", {
    timeZone: "Europe/Athens",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(utcDate);
  console.log(formattedDate);
  // Δημιουργία ώρας στη ζώνη ώρας Ελλάδας
  const formattedTime = new Intl.DateTimeFormat("el-GR", {
    timeZone: "Europe/Athens",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(utcDate);
  console.log(formattedTime);
  return { date: formattedDate, time: formattedTime };
};
