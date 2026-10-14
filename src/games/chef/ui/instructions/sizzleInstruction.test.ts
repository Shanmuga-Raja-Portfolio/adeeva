import { describe, expect, it } from "vitest";
import type { SizzleDef } from "../../content/dish";
import { flipPiece, startPan, stepPan, takeOff, type PanSim } from "../screens/cook/panSim";
import { PAUSED_LINE } from "./pausedLine";
import { setHeatLine, sizzleInstruction, SIZZLE_LINES } from "./sizzleInstruction";

const def: SizzleDef = { piece: "plantain", count: 2, idealDots: 4, flips: 1 };
const eggs: SizzleDef = { piece: "egg", count: 1, idealDots: 3, flips: 2 };

const read = (sim: PanSim | null, change: { heat?: number; assisted?: boolean; paused?: boolean } = {}) =>
  sizzleInstruction({ def, sim, heat: 3, assisted: false, paused: false, ...change });

const flipAll = (sim: PanSim) => sim.pieces.reduce((next, _piece, index) => flipPiece(next, def, index), sim);

describe("Sizzle instruction", () => {
  it("asks for the dish card's heat before the pan starts, then for Into the pan", () => {
    expect(read(null)).toBe(setHeatLine(4));
    expect(read(null, { heat: 4 })).toBe(SIZZLE_LINES.rightHeat);
    expect(read(null, { assisted: true })).toBe(SIZZLE_LINES.presetHeat);
  });

  it("asks for flips while pieces are unflipped, then for Done once all are flipped", () => {
    const pan = startPan(def, 4);
    expect(read(pan)).toBe(SIZZLE_LINES.flipOrToss);
    const flipped = flipAll(stepPan(pan, def, 10));
    expect(read(flipped)).toBe(SIZZLE_LINES.takeOff);
    expect(read(takeOff(takeOff(stepPan(flipped, def, 10), 0), 1))).toBe(SIZZLE_LINES.done);
  });

  it("keeps asking for flips on egg layers that need a second flip", () => {
    const pan = flipPiece(stepPan(startPan(eggs, 3), eggs, 10), eggs, 0);
    expect(sizzleInstruction({ def: eggs, sim: pan, heat: 3, assisted: false, paused: false })).toBe(
      SIZZLE_LINES.flip,
    );
  });

  it("points a Pan helper player at the arrowed piece for each move", () => {
    const pan = startPan(def, 4);
    expect(read(pan, { assisted: true })).toBe(SIZZLE_LINES.arrowWait);
    const ready = stepPan(pan, def, 360);
    expect(read(ready, { assisted: true })).toBe(SIZZLE_LINES.arrowFlip);
    const flipped = stepPan(flipAll(ready), def, 360);
    expect(read(flipped, { assisted: true })).toBe(SIZZLE_LINES.arrowOff);
  });

  it("shows the pause line while paused", () => {
    expect(read(startPan(def, 4), { paused: true })).toBe(PAUSED_LINE);
  });
});
