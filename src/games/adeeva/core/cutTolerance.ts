import { difficultyById } from "./catalog";
import type { GameState } from "./gameState";

export const BASE_CUT_TOLERANCE_CM = 1.2;
export const PERFECTIONIST_TOLERANCE_MULTIPLIER = 1.2;
export const BIG_TABLE_TOLERANCE_MULTIPLIER = 1.15;
export const ASSISTANT_CUT_TOLERANCE_MULTIPLIER = 1.1;

export function cutTolerance(state: GameState): number {
  const trait = state.profile.trait === "perfectionist" ? PERFECTIONIST_TOLERANCE_MULTIPLIER : 1;
  const table = state.studio.upgrades.includes("big-table") ? BIG_TABLE_TOLERANCE_MULTIPLIER : 1;
  const assistant = state.studio.assistantHired ? ASSISTANT_CUT_TOLERANCE_MULTIPLIER : 1;
  const difficulty = difficultyById(state.profile.difficulty).toleranceMultiplier;
  return BASE_CUT_TOLERANCE_CM * trait * table * assistant * difficulty;
}
