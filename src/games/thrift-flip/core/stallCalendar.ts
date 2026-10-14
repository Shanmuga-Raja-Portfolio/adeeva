import { isWeekEnd } from "../../../engine/week";

export const STALL_DAY_REASON = "It's Stall Day! Flips wait until tomorrow.";

export function isStallDay(day: number): boolean {
  return isWeekEnd(day);
}

export function stallDayIssue(day: number): string | null {
  return isStallDay(day) ? STALL_DAY_REASON : null;
}
