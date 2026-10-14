import type { DifficultyId } from "../../../engine/difficulty";
import { PATH_RULES } from "../content/career";
import type { DishDef } from "../content/dish";
import type { DishRun } from "./dishRun";

export const READY_SECONDS = 60;
export const CHOP_ITEM_SECONDS = 30;
export const SIZZLE_SECONDS = 90;
export const SIMMER_LAP_SECONDS = 30;
export const TASTE_SECONDS = 20;
export const PINCH_SECONDS = 10;
export const PLATE_SECONDS = 60;
export const LATE_FALLOFF_SECONDS = 240;
export const LATE_FLOOR = 0.5;

export function studioSeconds(run: DishRun, dish: DishDef): number {
  const simmer = run.simmer === null ? 0 : run.simmer.follow.progress * SIMMER_LAP_SECONDS;
  const taste = run.taste === null ? 0 : run.taste.tastes * TASTE_SECONDS + run.taste.pinches * PINCH_SECONDS;
  return Math.round(
    READY_SECONDS +
      dish.chop.length * CHOP_ITEM_SECONDS +
      (dish.sizzle === null ? 0 : SIZZLE_SECONDS) +
      simmer +
      taste +
      PLATE_SECONDS,
  );
}

export function onClockShare(seconds: number, difficulty: DifficultyId): number {
  if (difficulty === "relaxed" || seconds <= PATH_RULES.segmentClockSeconds) return 1;
  const over = seconds - PATH_RULES.segmentClockSeconds;
  return Math.max(LATE_FLOOR, Math.round((1 - over / LATE_FALLOFF_SECONDS) * 100) / 100);
}
