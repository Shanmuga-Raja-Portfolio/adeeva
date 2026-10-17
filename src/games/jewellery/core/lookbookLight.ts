import { ASSIST_ACCURACY_CAP } from "../../../engine/assistCap";
import { clamp } from "../../../engine/clamp";
import { difficultyById } from "./catalog";
import type { GameState } from "./gameState";
import { PERFECTIONIST_MULTIPLIER } from "./skillTolerance";

export const LAMP_STEP = 5;
const BASE_BAND = 30;
const LIGHT_BOX_MULTIPLIER = 1.2;

export function lightBand(state: Pick<GameState, "profile" | "upgrades">): number {
  const trait = state.profile.trait === "perfectionist" ? PERFECTIONIST_MULTIPLIER : 1;
  const box = state.upgrades.includes("light-box") ? LIGHT_BOX_MULTIPLIER : 1;
  return BASE_BAND * trait * box * difficultyById(state.profile.difficulty).toleranceMultiplier;
}

export function angleDelta(a: number, b: number): number {
  const turn = (((a - b) % 360) + 360) % 360;
  return Math.min(turn, 360 - turn);
}

export function pageLight(angle: number, sweetSpot: number, band: number): number {
  const delta = angleDelta(angle, sweetSpot);
  return clamp(1 - (delta / band) ** 2, 0, 1);
}

export function snappedLight(angle: number, sweetSpot: number, band: number, assisted: boolean): number {
  const light = pageLight(angle, sweetSpot, band);
  return assisted ? Math.min(ASSIST_ACCURACY_CAP, light) : light;
}

export function isLampAngle(angle: number): boolean {
  return Number.isInteger(angle) && angle >= 0 && angle < 360 && angle % LAMP_STEP === 0;
}
