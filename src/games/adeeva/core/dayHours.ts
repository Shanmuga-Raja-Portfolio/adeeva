import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import type { StudioState } from "./gameState";

export const MOOD_BOARD_BONUS_HOURS = 1;

export function hoursPerDay(studio: StudioState): number {
  return BASE_DAY_HOURS + (studio.upgrades.includes("mood-board") ? MOOD_BOARD_BONUS_HOURS : 0);
}
