export const DAYS_PER_WEEK = 7;

export function isWeekEnd(day: number): boolean {
  return day % DAYS_PER_WEEK === 0;
}

export function weekEndDay(day: number): number {
  return Math.ceil(day / DAYS_PER_WEEK) * DAYS_PER_WEEK;
}
