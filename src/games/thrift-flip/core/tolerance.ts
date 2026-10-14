import type { MaterialId } from "../../../engine/palette";
import { BASE_CUT_TOLERANCE_CM, PERFECTIONIST_TOLERANCE_MULTIPLIER } from "../../adeeva/core/cutTolerance";
import { ASSIST_SEW_WIDENING, BASE_SEW_BAND, SEW_DIFFICULTY_NARROWING } from "../../adeeva/core/sewBand";
import { difficultyById, materialById } from "./catalog";
import type { GameState } from "./gameState";

export const MIN_PULL_CM = 1;
export const BASE_MAX_PULL_CM = 4;
export const PULL_DIFFICULTY_NARROWING = 0.5;
export const SHARP_RIPPER_MULTIPLIER = 1.15;

export const MIN_SCRUB_SPEED = 3;
export const BASE_GENTLE_SPEED = 60;
export const GENTLE_DIFFICULTY_NARROWING = 0.6;
export const WASH_TUB_GENTLE_MULTIPLIER = 1.15;
export const WASH_TUB_CLEAR_DIVISOR = 1.25;
export const BASE_TICKS_TO_CLEAR = 180;

export const CUTTING_MAT_MULTIPLIER = 1.15;
export const THREAD_LIBRARY_MULTIPLIER = 1.1;

const MATERIAL_SCRUB_FACTOR: Readonly<Record<MaterialId, number>> = {
  cotton: 1,
  linen: 1,
  denim: 1,
  wool: 1.2,
  silk: 1.3,
  satin: 1.3,
  velvet: 1.3,
  tulle: 1.3,
};

type ToleranceState = Pick<GameState, "profile" | "upgrades">;

function shared(state: ToleranceState): number {
  const trait = state.profile.trait === "perfectionist" ? PERFECTIONIST_TOLERANCE_MULTIPLIER : 1;
  return trait * difficultyById(state.profile.difficulty).toleranceMultiplier;
}

function owns(state: ToleranceState, upgrade: GameState["upgrades"][number]): boolean {
  return state.upgrades.includes(upgrade);
}

export function maxPull(state: ToleranceState, material: MaterialId): number {
  const fabric = 1 - PULL_DIFFICULTY_NARROWING * materialById(material).sewDifficulty;
  const ripper = owns(state, "sharp-ripper") ? SHARP_RIPPER_MULTIPLIER : 1;
  return BASE_MAX_PULL_CM * fabric * ripper * shared(state);
}

export function gentleLimit(state: ToleranceState, material: MaterialId): number {
  const fabric = 1 - GENTLE_DIFFICULTY_NARROWING * materialById(material).sewDifficulty;
  const tub = owns(state, "wash-tub") ? WASH_TUB_GENTLE_MULTIPLIER : 1;
  return BASE_GENTLE_SPEED * fabric * tub * shared(state);
}

export function ticksToClear(state: ToleranceState, material: MaterialId): number {
  const tub = owns(state, "wash-tub") ? WASH_TUB_CLEAR_DIVISOR : 1;
  return (BASE_TICKS_TO_CLEAR * MATERIAL_SCRUB_FACTOR[material]) / tub;
}

export function cutTolerance(state: ToleranceState): number {
  const mat = owns(state, "cutting-mat") ? CUTTING_MAT_MULTIPLIER : 1;
  return BASE_CUT_TOLERANCE_CM * mat * shared(state);
}

export function sewBand(state: ToleranceState, material: MaterialId, assisted: boolean): number {
  const fabric = 1 - SEW_DIFFICULTY_NARROWING * materialById(material).sewDifficulty;
  const assist = assisted ? ASSIST_SEW_WIDENING : 1;
  const library = owns(state, "thread-library") ? THREAD_LIBRARY_MULTIPLIER : 1;
  return BASE_SEW_BAND * fabric * shared(state) * assist * library;
}
