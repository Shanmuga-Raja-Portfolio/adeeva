import { DAYS_PER_WEEK } from "../../../core";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export function weekdayName(day: number): string {
  const index = (((day - 1) % DAYS_PER_WEEK) + DAYS_PER_WEEK) % DAYS_PER_WEEK;
  return WEEKDAYS[index] ?? "Monday";
}

export function weekNumber(day: number): number {
  return Math.floor((day - 1) / DAYS_PER_WEEK) + 1;
}

export function daysUntilWeekEnd(day: number): number {
  return (DAYS_PER_WEEK - (day % DAYS_PER_WEEK)) % DAYS_PER_WEEK;
}
