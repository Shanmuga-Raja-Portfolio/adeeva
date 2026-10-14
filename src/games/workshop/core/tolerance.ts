import type { JointKindId } from "../content/jointKind";
import type { UpgradeId } from "../content/upgrade";
import type { WoodId } from "../content/wood";
import { difficultyById, jointKindById, woodById } from "./catalog";
import type { GameState } from "./gameState";

export const BASE_CUT_TOLERANCE_CM = 1.2;
const PERFECTIONIST_MULTIPLIER = 1.2;
const UPGRADE_MULTIPLIER = 1.15;
const HARDNESS_NARROWING = 0.4;
const BASE_SAND_ANGLE_DEG = 25;
const BASE_SEAM_BAND = 0.12;
const ASSIST_SEAM_WIDENING = 1.6;

export type ToleranceState = Pick<GameState, "profile" | "upgrades">;

export interface JointTolerance {
  readonly offsetMm: number;
  readonly angleDeg: number;
}

function hardFactor(woodId: WoodId): number {
  return 1 - HARDNESS_NARROWING * woodById(woodId).hardness;
}

function handMultiplier(state: ToleranceState): number {
  const trait = state.profile.trait === "perfectionist" ? PERFECTIONIST_MULTIPLIER : 1;
  return trait * difficultyById(state.profile.difficulty).toleranceMultiplier;
}

function upgradeMultiplier(state: ToleranceState, upgrade: UpgradeId): number {
  return state.upgrades.includes(upgrade) ? UPGRADE_MULTIPLIER : 1;
}

export function sawTolerance(state: ToleranceState, woodId: WoodId): number {
  return (
    BASE_CUT_TOLERANCE_CM *
    handMultiplier(state) *
    upgradeMultiplier(state, "sturdy-sawhorses") *
    hardFactor(woodId)
  );
}

export function jointTolerance(state: ToleranceState, woodId: WoodId, kind: JointKindId): JointTolerance {
  const def = jointKindById(kind);
  const multiplier = handMultiplier(state) * upgradeMultiplier(state, "clamp-rack") * hardFactor(woodId);
  return { offsetMm: def.baseOffsetMm * multiplier, angleDeg: def.baseAngleDeg * multiplier };
}

export function sandAngleLimit(state: ToleranceState): number {
  return BASE_SAND_ANGLE_DEG * handMultiplier(state);
}

export function seamBand(state: ToleranceState, assisted: boolean): number {
  return BASE_SEAM_BAND * handMultiplier(state) * (assisted ? ASSIST_SEAM_WIDENING : 1);
}
