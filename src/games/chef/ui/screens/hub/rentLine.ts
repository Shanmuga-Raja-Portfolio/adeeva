export function rentLine(bill: number, home: string, rentIn: number): string {
  if (bill === 0) return `No rent for ${home} on this difficulty.`;
  if (rentIn === 0) return `Rent of ${bill} coins for ${home} is due tonight.`;
  return `Rent for ${home}: ${bill} coins in ${rentIn} ${rentIn === 1 ? "day" : "days"}.`;
}
