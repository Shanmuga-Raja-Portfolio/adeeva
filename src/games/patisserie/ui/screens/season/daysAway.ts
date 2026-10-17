export function daysAway(day: number, target: number): string {
  const days = target - day;
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return days > 0 ? `in ${days} days` : "done";
}
