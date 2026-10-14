import { DIFFICULTY_RULES } from "../../../engine/difficulty";
import { ASSIST_ACCURACY_CAP } from "../../../engine/assistCap";
import type { UpgradeId } from "../content/upgrade";
import { difficultyById } from "./catalog";
import type { GameState } from "./gameState";

const PERFECTIONIST_MULTIPLIER = 1.2;
const TOOL_MULTIPLIER = 1.15;
export const CHALLENGING_ASSIST_CAP = 0.7;
const BASE_EDGE_TOLERANCE_CM = 1.2;
const BASE_SPLAT_SPEED = 1600;
const BASE_FLOOR_TOLERANCE_CM = 2.5;

export type SkillState = Pick<GameState, "profile" | "upgrades">;

export function difficultyMultiplier(state: Pick<GameState, "profile">): number {
  return difficultyById(state.profile.difficulty).toleranceMultiplier;
}

function handMultiplier(state: SkillState): number {
  const trait = state.profile.trait === "perfectionist" ? PERFECTIONIST_MULTIPLIER : 1;
  return trait * difficultyMultiplier(state);
}

function toolMultiplier(state: SkillState, tool: UpgradeId): number {
  return state.upgrades.includes(tool) ? TOOL_MULTIPLIER : 1;
}

export function edgeTolerance(state: SkillState): number {
  return BASE_EDGE_TOLERANCE_CM * handMultiplier(state) * toolMultiplier(state, "long-reach-brush");
}

export function splatSpeed(state: SkillState): number {
  return BASE_SPLAT_SPEED * handMultiplier(state);
}

export function floorTolerance(state: SkillState): number {
  return BASE_FLOOR_TOLERANCE_CM * handMultiplier(state) * toolMultiplier(state, "spacer-kit");
}

export const WIDEST_FLOOR_TOLERANCE_CM =
  BASE_FLOOR_TOLERANCE_CM *
  PERFECTIONIST_MULTIPLIER *
  TOOL_MULTIPLIER *
  Math.max(...Object.values(DIFFICULTY_RULES).map((rules) => rules.toleranceMultiplier));

export function assistCap(state: Pick<GameState, "profile">): number {
  return state.profile.difficulty === "challenging" ? CHALLENGING_ASSIST_CAP : ASSIST_ACCURACY_CAP;
}

export function capped(state: Pick<GameState, "profile">, raw: number, assisted: boolean): number {
  return assisted ? Math.min(assistCap(state), raw) : raw;
}
