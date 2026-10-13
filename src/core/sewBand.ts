import type { MaterialId } from "../content/material";
import { difficultyById, materialById } from "./catalog";
import { PERFECTIONIST_TOLERANCE_MULTIPLIER } from "./cutTolerance";
import type { GameState } from "./gameState";

export const BASE_SEW_BAND = 0.12;
export const SEW_DIFFICULTY_NARROWING = 0.5;
export const PRO_MACHINE_BAND_MULTIPLIER = 1.15;
export const ASSIST_SEW_WIDENING = 1.6;

function materialBandMultiplier(materialId: MaterialId): number {
  return 1 - SEW_DIFFICULTY_NARROWING * materialById(materialId).sewDifficulty;
}

export function sewBand(state: GameState, materialId: MaterialId, assisted: boolean): number {
  const trait = state.profile.trait === "perfectionist" ? PERFECTIONIST_TOLERANCE_MULTIPLIER : 1;
  const machine = state.studio.upgrades.includes("pro-machine") ? PRO_MACHINE_BAND_MULTIPLIER : 1;
  const difficulty = difficultyById(state.profile.difficulty).toleranceMultiplier;
  const assist = assisted ? ASSIST_SEW_WIDENING : 1;
  return BASE_SEW_BAND * materialBandMultiplier(materialId) * trait * machine * difficulty * assist;
}
