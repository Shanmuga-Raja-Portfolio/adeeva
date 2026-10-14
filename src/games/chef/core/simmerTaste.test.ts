import { describe, expect, it } from "vitest";
import type { SimmerDef, TasteDef } from "../content/dish";
import { levelScore, progressAtTarget, scoreSimmer, simmerHalo, simmerLevel } from "./simmer";
import {
  bestPinches,
  cuisineJars,
  dishTasteStart,
  minimumPinches,
  scoreTaste,
  suggestedJar,
  tasteAfter,
} from "./taste";

const SAUCE: SimmerDef = {
  path: "figure-eight",
  colour: "#d9472b",
  laps: 3,
  startLevel: 0.86,
  targetLevel: 0.42,
};
const DAL_TASTE: TasteDef = { start: [-2, -1], target: [1, -1], savoury: 1 };

describe("Simmer scoring", () => {
  it("lowers the level while you stir and reaches the line at 80% of the laps", () => {
    expect(simmerLevel(SAUCE, 3, 0)).toBe(0.86);
    expect(simmerLevel(SAUCE, 3, progressAtTarget(3))).toBeCloseTo(0.42);
    expect(simmerLevel(SAUCE, 3, 3)).toBeLessThan(0.42);
  });

  it("weights following 70% and stopping on the line 30%", () => {
    const perfect = scoreSimmer(SAUCE, 3, { progress: 2.4, ticks: 576, insideTicks: 576, assisted: false });
    expect(perfect.accuracy).toBeCloseTo(1);
    const wobbly = scoreSimmer(SAUCE, 3, { progress: 2.4, ticks: 576, insideTicks: 288, assisted: false });
    expect(wobbly.accuracy).toBeCloseTo(0.65);
    const late = scoreSimmer(SAUCE, 3, { progress: 3, ticks: 720, insideTicks: 720, assisted: false });
    expect(late.levelScore).toBeLessThan(1);
    expect(levelScore(0.5, 0.42)).toBeCloseTo(0.9);
  });

  it("caps the steady ladle at 0.8 and widens its glow", () => {
    expect(
      scoreSimmer(SAUCE, 3, { progress: 2.4, ticks: 576, insideTicks: 576, assisted: true }).accuracy,
    ).toBe(0.8);
    expect(simmerHalo(1, true)).toBeCloseTo(28 * 1.6);
    expect(simmerHalo(1.2, false)).toBeCloseTo(28 * 1.2);
  });
});

describe("Taste and season scoring", () => {
  const jars = cuisineJars("indian");

  it("shows four cuisine jars plus the savoury pinch", () => {
    expect(jars).toEqual([
      "lime-squeeze",
      "garam-masala-pinch",
      "ginger-paste",
      "fresh-herbs",
      "savoury-pinch",
    ]);
  });

  it("finds the shortest way to balance the dish", () => {
    const start = dishTasteStart(DAL_TASTE);
    expect(minimumPinches(DAL_TASTE, jars, start)).toBe(3);
    const best = bestPinches(DAL_TASTE, jars, start) ?? [];
    const end = tasteAfter(start, best);
    expect(end.point).toEqual([1, -1]);
    expect(end.savoury).toBe(1);
    expect(best[0] === undefined ? null : suggestedJar(DAL_TASTE, jars, start)).toBe(best[0]);
  });

  it("scores full marks for a tidy solution and loses a little per extra taste", () => {
    const start = dishTasteStart(DAL_TASTE);
    const pinches = bestPinches(DAL_TASTE, jars, start) ?? [];
    expect(
      scoreTaste(DAL_TASTE, jars, start, { pinches, tastes: 3, assisted: false }, 1, false).accuracy,
    ).toBe(1);
    expect(
      scoreTaste(DAL_TASTE, jars, start, { pinches, tastes: 5, assisted: false }, 1, false).accuracy,
    ).toBeCloseTo(0.94);
    expect(
      scoreTaste(DAL_TASTE, jars, start, { pinches, tastes: 5, assisted: false }, 1, true).accuracy,
    ).toBe(1);
  });

  it("scores by distance, savoury dots and tidiness", () => {
    const start = dishTasteStart(DAL_TASTE);
    const missed = scoreTaste(DAL_TASTE, jars, start, { pinches: [], tastes: 1, assisted: false }, 1, false);
    expect(missed.accuracy).toBeCloseTo((1 - (3 - 1) / 3) * 0.85);
    expect(missed.solved).toBe(false);
    const messy = [
      "fresh-herbs",
      "garam-masala-pinch",
      "lime-squeeze",
      "ginger-paste",
      "fresh-herbs",
      "garam-masala-pinch",
      "ginger-paste",
      "savoury-pinch",
    ] as const;
    const end = tasteAfter(start, messy);
    expect(end.point).toEqual([2, 2]);
    expect(
      scoreTaste(DAL_TASTE, jars, start, { pinches: messy, tastes: 1, assisted: true }, 1, false).accuracy,
    ).toBeLessThanOrEqual(0.8);
  });
});
