import type { GameState, StudioState } from "./gameState";

export const BASE_DAY_HOURS = 10;
export const MOOD_BOARD_BONUS_HOURS = 1;

export function hoursPerDay(studio: StudioState): number {
  return BASE_DAY_HOURS + (studio.upgrades.includes("mood-board") ? MOOD_BOARD_BONUS_HOURS : 0);
}

export function hasHours(state: GameState, hours: number): boolean {
  return state.calendar.hoursLeft >= hours;
}

export function spendHours(state: GameState, hours: number): GameState | null {
  if (!hasHours(state, hours)) return null;
  if (hours === 0) return state;
  return { ...state, calendar: { ...state.calendar, hoursLeft: state.calendar.hoursLeft - hours } };
}

export function hoursShortfallReason(state: GameState, hours: number): string | null {
  if (hasHours(state, hours)) return null;
  return `This needs ${hours} ${hours === 1 ? "hour" : "hours"} and only ${state.calendar.hoursLeft} ${state.calendar.hoursLeft === 1 ? "is" : "are"} left today. End the day to continue.`;
}
