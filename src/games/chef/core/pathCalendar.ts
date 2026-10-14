import { DAYS_PER_WEEK } from "../../../engine/week";

export const FIRST_NIGHT = 2;
export const LAST_NIGHT = 6;
export const SERVICE_NIGHTS = [2, 3, 4, 5, 6] as const;

export function nightOfWeek(day: number): number {
  return ((((day - 1) % DAYS_PER_WEEK) + DAYS_PER_WEEK) % DAYS_PER_WEEK) + 1;
}

export function isServiceNight(day: number): boolean {
  const night = nightOfWeek(day);
  return night >= FIRST_NIGHT && night <= LAST_NIGHT;
}

export function isWeekStart(day: number): boolean {
  return nightOfWeek(day) === 1;
}

export function serviceNightsBetween(from: number, to: number): number[] {
  const days: number[] = [];
  for (let day = from; day <= to; day += 1) if (isServiceNight(day)) days.push(day);
  return days;
}

export function weekServiceNights(day: number): number[] {
  const end = day + (DAYS_PER_WEEK - nightOfWeek(day));
  return serviceNightsBetween(day, end);
}
