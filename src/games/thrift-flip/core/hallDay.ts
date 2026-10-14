import type { GameState } from "./gameState";

export const HALL_DAY_REASON = "Today belongs to Swap & Mend in the hall.";

export function swapDayIsToday(state: Pick<GameState, "boutique" | "calendar">): boolean {
  const swapDay = state.boutique?.season.swapDay ?? null;
  return swapDay !== null && swapDay.day === state.calendar.day;
}

export function hallCommittedToday(state: Pick<GameState, "boutique" | "calendar">): boolean {
  return swapDayIsToday(state) && state.boutique?.season.swapDay?.committed === true;
}

export function hallClosedIssue(state: Pick<GameState, "boutique" | "calendar">): string | null {
  return hallCommittedToday(state) ? HALL_DAY_REASON : null;
}
