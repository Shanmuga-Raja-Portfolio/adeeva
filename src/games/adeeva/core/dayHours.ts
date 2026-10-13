import {
  BASE_DAY_HOURS,
  hoursShortfallReason as clockShortfallReason,
  spendCalendarHours,
} from "../../../engine/dayHours";
import type { GameState, StudioState } from "./gameState";

export const MOOD_BOARD_BONUS_HOURS = 1;

export function hoursPerDay(studio: StudioState): number {
  return BASE_DAY_HOURS + (studio.upgrades.includes("mood-board") ? MOOD_BOARD_BONUS_HOURS : 0);
}

export function spendHours(state: GameState, hours: number): GameState | null {
  const calendar = spendCalendarHours(state.calendar, hours);
  if (calendar === null) return null;
  return calendar === state.calendar ? state : { ...state, calendar };
}

export function hoursShortfallReason(state: GameState, hours: number): string | null {
  return clockShortfallReason(state.calendar, hours);
}
