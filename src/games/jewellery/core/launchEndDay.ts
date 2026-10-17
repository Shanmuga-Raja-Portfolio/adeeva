import type { GameState } from "./gameState";
import { launchReady } from "./launchStatus";
import { isLanternNight, isPopupDay, loftCollection } from "./seasonCalendar";

export const LANTERNS_WAITING = "The lanterns are waiting for your line.";
export const LATE_LAUNCH_HOURS = 4;

export function launchEndDayIssue(state: GameState): string | null {
  const collection = loftCollection(state);
  if (collection === null || !isPopupDay(state, state.calendar.day)) return null;
  if (state.calendar.hoursLeft < LATE_LAUNCH_HOURS) return null;
  return launchReady(state, collection) ? LANTERNS_WAITING : null;
}

export function lanternNightUnstaged(state: GameState): boolean {
  const collection = loftCollection(state);
  return collection !== null && isLanternNight(state, state.calendar.day) && launchReady(state, collection);
}
