import type { SizzleDef } from "../../content/dish";
import { panDone, readyFor, type PanSim } from "../screens/cook/panSim";
import { PAUSED_LINE } from "./pausedLine";

export interface SizzleMoment {
  readonly def: SizzleDef;
  readonly sim: PanSim | null;
  readonly heat: number;
  readonly assisted: boolean;
  readonly paused: boolean;
}

export const SIZZLE_LINES = {
  presetHeat: "The heat is set for you. Tap Into the pan!",
  rightHeat: "Just right! Tap Into the pan!",
  flipOrToss: "Flip each piece at golden: tap it, or swipe up for all.",
  flip: "Tap each piece to flip it when it turns golden.",
  takeOff: "When each piece is golden, drag it onto Done.",
  arrowFlip: "Tap the piece with the arrow to flip it.",
  arrowOff: "Drag the piece with the arrow onto Done.",
  arrowWait: "Wait for the bell. An arrow shows which piece.",
  done: "All off the heat. Lovely sizzle!",
} as const;

export function setHeatLine(dots: number): string {
  return `Set the heat to ${dots} dots, then tap Into the pan!`;
}

function assistedLine(def: SizzleDef, sim: PanSim): string {
  const ready = sim.pieces.map((piece) => readyFor(piece, def));
  if (ready.includes("flip")) return SIZZLE_LINES.arrowFlip;
  if (ready.includes("off")) return SIZZLE_LINES.arrowOff;
  return SIZZLE_LINES.arrowWait;
}

function cookingLine(def: SizzleDef, sim: PanSim): string {
  const cooking = sim.pieces.filter((piece) => !piece.off);
  if (cooking.some((piece) => piece.side === 0)) return SIZZLE_LINES.flipOrToss;
  if (cooking.some((piece) => piece.side < def.flips)) return SIZZLE_LINES.flip;
  return SIZZLE_LINES.takeOff;
}

export function sizzleInstruction({ def, sim, heat, assisted, paused }: SizzleMoment): string {
  if (sim === null) {
    if (assisted) return SIZZLE_LINES.presetHeat;
    return heat === def.idealDots ? SIZZLE_LINES.rightHeat : setHeatLine(def.idealDots);
  }
  if (panDone(sim)) return SIZZLE_LINES.done;
  if (paused) return PAUSED_LINE;
  return assisted ? assistedLine(def, sim) : cookingLine(def, sim);
}
