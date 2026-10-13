import { hoursShortfallReason as clockShortfallReason, spendCalendarHours } from "../../../engine/dayHours";
import type { GameState } from "./gameState";

export function spendHours(state: GameState, hours: number): GameState | null {
  const calendar = spendCalendarHours(state.calendar, hours);
  if (calendar === null) return null;
  return calendar === state.calendar ? state : { ...state, calendar };
}

export function hoursShortfallReason(state: GameState, hours: number): string | null {
  return clockShortfallReason(state.calendar, hours);
}
