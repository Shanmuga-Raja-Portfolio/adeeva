import type { UpgradeId } from "../content/upgrade";
import { difficultyById } from "./catalog";
import type { GameState } from "./gameState";

export const PERFECTIONIST_MULTIPLIER = 1.2;
const TOOL_MULTIPLIER = 1.15;

export type SkillState = Pick<GameState, "profile" | "upgrades">;

export function skillMultiplier(state: SkillState, tool: UpgradeId): number {
  const trait = state.profile.trait === "perfectionist" ? PERFECTIONIST_MULTIPLIER : 1;
  const upgrade = state.upgrades.includes(tool) ? TOOL_MULTIPLIER : 1;
  return trait * upgrade * difficultyById(state.profile.difficulty).toleranceMultiplier;
}
