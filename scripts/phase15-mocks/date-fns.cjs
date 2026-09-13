function parseISO(value) { return new Date(`${value}T00:00:00`); }
function differenceInCalendarDays(left, right) {
  const a = new Date(left.getFullYear(), left.getMonth(), left.getDate()).getTime();
  const b = new Date(right.getFullYear(), right.getMonth(), right.getDate()).getTime();
  return Math.round((a - b) / 86400000);
}
module.exports = { parseISO, differenceInCalendarDays };
