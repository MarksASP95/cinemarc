export const minimizeDate = (date: Date): Date => {
  const returnDate = new Date(date);
  returnDate.setHours(0);
  returnDate.setMinutes(0);
  returnDate.setSeconds(0);
  returnDate.setMilliseconds(0);

  return returnDate;
};