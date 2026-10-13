import type { UpgradeId } from "../content/upgrade";
import { difficultyById } from "./catalog";
import type { GameState } from "./gameState";

export const PERFECTIONIST_TOLERANCE_MULTIPLIER = 1.2;

export interface ToolBoost {
  readonly upgrade: UpgradeId;
  readonly multiplier: number;
}

export function skillTolerance(state: GameState, boost: ToolBoost | null): number {
  const trait = state.profile.trait === "perfectionist" ? PERFECTIONIST_TOLERANCE_MULTIPLIER : 1;
  const tool = boost !== null && state.upgrades.includes(boost.upgrade) ? boost.multiplier : 1;
  return trait * tool * difficultyById(state.profile.difficulty).toleranceMultiplier;
}
