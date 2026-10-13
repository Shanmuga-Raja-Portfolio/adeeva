import { cappedAccuracy } from "../../../engine/assistCap";
import type { IngredientDef } from "../content/ingredient";
import type { WeighAttempt } from "./bakeRun";
import type { GameState } from "./gameState";
import { skillTolerance } from "./skillTolerance";

export const BASE_WEIGH_BAND = 0.05;
export const BRIGHT_SCALE_MULTIPLIER = 1.2;
export const SLOW_FLOW_SHARE = 0.08;
export const FAST_FLOW_SHARE = 0.6;
export const RAMP_DELAY_SECONDS = 1.5;
export const RAMP_SECONDS = 0.5;
export const MAX_POUR_MULTIPLE = 3;
export const SCOOP_BACK_SHARE = 0.1;
export const MAX_WEIGH_ACTIONS = 40;
const TIDY_FREE_EXTRA = 2;
const TIDY_STEP = 0.04;
const TIDY_FLOOR = 0.6;

export function weighBand(state: GameState): number {
  return (
    BASE_WEIGH_BAND * skillTolerance(state, { upgrade: "bright-scale", multiplier: BRIGHT_SCALE_MULTIPLIER })
  );
}

export function pourFlow(target: number, heldSeconds: number): number {
  const ramp = Math.min(1, Math.max(0, (heldSeconds - RAMP_DELAY_SECONDS) / RAMP_SECONDS));
  return target * (SLOW_FLOW_SHARE + (FAST_FLOW_SHARE - SLOW_FLOW_SHARE) * ramp);
}

export function settleGrams(flowAtRelease: number, pourDifficulty: number): number {
  return flowAtRelease * (0.1 + 0.25 * pourDifficulty);
}

export function pourCap(target: number, stock: number): number {
  return Math.max(0, Math.min(MAX_POUR_MULTIPLE * target, stock));
}

export function scoopBackGrams(ingredient: IngredientDef, target: number): number {
  return ingredient.mode === "piece"
    ? ingredient.pieceGrams
    : Math.max(1, Math.round(SCOOP_BACK_SHARE * target));
}

export function minimumActions(ingredient: IngredientDef, target: number): number {
  return ingredient.mode === "piece" ? Math.ceil(target / ingredient.pieceGrams) : 1;
}

export function tidyFactor(ingredient: IngredientDef, target: number, actions: number): number {
  const extra = actions - minimumActions(ingredient, target);
  return Math.max(TIDY_FLOOR, 1 - TIDY_STEP * Math.max(0, extra - TIDY_FREE_EXTRA));
}

export function bandAccuracy(grams: number, target: number, band: number): number {
  const error = Math.abs(grams - target) / target;
  if (error <= band) return 1;
  return Math.max(0, 1 - (error - band) / (3 * band));
}

export function weighAccuracy(
  record: WeighAttempt,
  ingredient: IngredientDef,
  target: number,
  band: number,
): number {
  const raw = bandAccuracy(record.grams, target, band) * tidyFactor(ingredient, target, record.actions);
  return cappedAccuracy(raw, record.assisted);
}

export function isWeighRecordValid(
  record: WeighAttempt,
  ingredient: IngredientDef,
  target: number,
  stock: number,
): boolean {
  return (
    Number.isInteger(record.grams) &&
    record.grams >= 0 &&
    record.grams <= pourCap(target, stock) &&
    (ingredient.mode !== "piece" || record.grams % ingredient.pieceGrams === 0) &&
    Number.isInteger(record.actions) &&
    record.actions >= 1 &&
    record.actions <= MAX_WEIGH_ACTIONS &&
    typeof record.assisted === "boolean"
  );
}
