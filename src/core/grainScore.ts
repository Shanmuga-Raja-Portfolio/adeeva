import type { PatternPieceDef } from "../content/garmentPart";
import type { GarmentSlot } from "../content/garmentSlot";
import type { Rotation } from "./rotation";

export const STRAIGHT_GRAIN_SCORE = 1;
export const BIAS_FRIENDLY_BIAS_SCORE = 1;
export const BIAS_SCORE = 0.7;
export const CROSS_GRAIN_SCORE = 0.6;
export const BIAS_BONUS_SLOTS: readonly GarmentSlot[] = ["skirt-front", "skirt-back"];

export type GrainPiece = Pick<PatternPieceDef, "grain" | "slot">;

export function isBiasRotation(rotation: Rotation): boolean {
  return rotation % 90 === 45;
}

export function earnsBiasBonus(piece: GrainPiece, rotation: Rotation): boolean {
  return piece.grain === "bias-friendly" && BIAS_BONUS_SLOTS.includes(piece.slot) && isBiasRotation(rotation);
}

export function grainScore(piece: GrainPiece, rotation: Rotation): number {
  if (rotation % 180 === 0) return STRAIGHT_GRAIN_SCORE;
  if (earnsBiasBonus(piece, rotation)) return BIAS_FRIENDLY_BIAS_SCORE;
  if (isBiasRotation(rotation)) return BIAS_SCORE;
  return CROSS_GRAIN_SCORE;
}
