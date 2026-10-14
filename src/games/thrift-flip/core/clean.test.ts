import { describe, expect, it } from "vitest";
import { ASSIST_CLEAN_CAP, cellThreshold, cleanAccuracy, isCleanComplete, MAX_SCRUB_TICKS } from "./clean";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { restoredCondition } from "./restoration";
import {
  dispatchAll,
  flipAtUnpick,
  newTestGame,
  runOf,
  scrubAll,
  settleStories,
  unpickAll,
} from "./testPlaythrough";
import { gentleLimit, ticksToClear } from "./tolerance";

function atClean(
  grade: "like-new" | "loved" | "tired",
  base: GameState = settleStories(newTestGame()),
): GameState {
  const unpicking = flipAtUnpick(base, "nana-bea", { recipeId: "cushion-cover", parts: {} }, [
    { findId: "linen-curtain", grade },
  ]);
  return reduce(unpickAll(unpicking, 2), { type: "goToStage", stage: "clean" });
}

describe("scrub stains", () => {
  it("sets a gentle limit and clearing time per material, trait and upgrade", () => {
    const state = newTestGame();
    expect(gentleLimit(state, "cotton")).toBeCloseTo(56.4, 5);
    expect(gentleLimit(state, "silk")).toBeCloseTo(34.8, 5);
    expect(gentleLimit({ ...state, upgrades: ["wash-tub"] }, "cotton")).toBeCloseTo(56.4 * 1.15, 5);
    expect(ticksToClear(state, "cotton")).toBe(180);
    expect(ticksToClear(state, "wool")).toBeCloseTo(216, 5);
    expect(ticksToClear(state, "satin")).toBeCloseTo(234, 5);
    expect(ticksToClear({ ...state, upgrades: ["wash-tub"] }, "cotton")).toBeCloseTo(144, 5);
    const perfectionist = { ...state, profile: { ...state.profile, trait: "perfectionist" as const } };
    expect(gentleLimit(perfectionist, "cotton")).toBeCloseTo(56.4 * 1.2, 5);
  });

  it("rolls one stain for a like-new find and three plus a worn spot for a tired one", () => {
    const likeNew = runOf(atClean("like-new"));
    const tired = runOf(atClean("tired"));
    expect(likeNew.finds[0]?.stains).toHaveLength(1);
    expect(likeNew.finds[0]?.wornSpot).toBeNull();
    expect(tired.finds[0]?.stains).toHaveLength(3);
    expect(tired.finds[0]?.wornSpot).not.toBeNull();
  });

  it("clears cells with gentle moving ticks and fades with harsh ones", () => {
    const state = atClean("loved");
    const gentle = scrubAll(state, 0);
    expect(isCleanComplete(gentle, runOf(gentle))).toBe(true);
    expect(cleanAccuracy(gentle, runOf(gentle))).toBe(1);
    const harsh = scrubAll(atClean("like-new"), 0.5);
    const owned = runOf(harsh).finds[0];
    const stain = owned?.stains[0];
    if (owned === undefined || stain === undefined) throw new Error("No stain");
    const moving = Math.ceil(cellThreshold(harsh, owned, stain)) * stain.cells;
    const expectedFade = Math.min(0.3, 0.002 * Math.round(moving * 0.5));
    expect(expectedFade).toBeGreaterThan(0);
    expect(cleanAccuracy(harsh, runOf(harsh))).toBeCloseTo(1 - expectedFade, 5);
  });

  it("leaves dirt when only part of a stain is scrubbed", () => {
    const state = atClean("like-new");
    const owned = runOf(state).finds[0];
    const stain = owned?.stains[0];
    if (owned === undefined || stain === undefined) throw new Error("No stain");
    const perCell = Math.ceil(cellThreshold(state, owned, stain));
    const half = Math.floor(stain.cells / 2);
    const cellTicks = Array.from({ length: stain.cells }, (_, index) => (index < half ? perCell : 0));
    const scrubbed = reduce(state, {
      type: "scrubStain",
      findKey: owned.id,
      stainId: stain.id,
      cellTicks,
      harshTicks: 0,
      scrubTicks: perCell * half,
    });
    expect(cleanAccuracy(scrubbed, runOf(scrubbed))).toBeCloseTo(half / stain.cells, 5);
    expect(isCleanComplete(scrubbed, runOf(scrubbed))).toBe(false);
  });

  it("refuses counts that shrink, overflow or don't add up", () => {
    const state = atClean("like-new");
    const owned = runOf(state).finds[0];
    const stain = owned?.stains[0];
    if (owned === undefined || stain === undefined) throw new Error("No stain");
    const sample = (cellTicks: number[], harshTicks: number, scrubTicks: number) =>
      ({
        type: "scrubStain",
        findKey: owned.id,
        stainId: stain.id,
        cellTicks,
        harshTicks,
        scrubTicks,
      }) as const;
    const ones = Array.from({ length: stain.cells }, () => 1);
    const started = reduce(state, sample(ones, 0, stain.cells));
    expect(started).not.toBe(state);
    const zeros = Array.from({ length: stain.cells }, () => 0);
    expect(reduce(started, sample(zeros, 0, stain.cells + 1))).toBe(started);
    expect(reduce(started, sample(ones, 5, 4))).toBe(started);
    expect(reduce(started, sample(ones, 0, MAX_SCRUB_TICKS + 1))).toBe(started);
    expect(reduce(started, sample([1], 0, 50))).toBe(started);
    expect(reduce(started, sample(ones, 0, stain.cells))).toBe(started);
  });

  it("soaks every stain with assist, capped at 0.7 and no fading", () => {
    const state = atClean("tired");
    const soaked = reduce(state, { type: "soakStains" });
    expect(isCleanComplete(soaked, runOf(soaked))).toBe(true);
    expect(cleanAccuracy(soaked, runOf(soaked))).toBe(ASSIST_CLEAN_CAP);
    expect(reduce(soaked, { type: "soakStains" })).toBe(soaked);
  });

  it("restores condition from cleaning and loses some to snags", () => {
    const state = scrubAll(atClean("tired"), 0);
    const owned = runOf(state).finds[0];
    if (owned === undefined) throw new Error("No find");
    expect(restoredCondition(state, runOf(state), owned)).toBeCloseTo(0.5 + 0.5 * 1 * 0.8, 5);
    const unpicking = flipAtUnpick(
      settleStories(newTestGame()),
      "nana-bea",
      { recipeId: "cushion-cover", parts: {} },
      [{ findId: "linen-curtain", grade: "like-new" }],
    );
    const key = runOf(unpicking).finds[0]?.id ?? "";
    const snagged = dispatchAll(unpicking, [
      { type: "pullStitch", findKey: key, line: 0, stitch: 0, distanceCm: 30, assisted: false },
      { type: "pullStitch", findKey: key, line: 0, stitch: 0, distanceCm: 30, assisted: false },
    ]);
    const snaggedFind = runOf(snagged).finds[0];
    if (snaggedFind === undefined) throw new Error("No find");
    expect(restoredCondition(snagged, runOf(snagged), snaggedFind)).toBeCloseTo(0.9 - 0.04, 5);
  });
});
