import { describe, expect, it } from "vitest";
import { lineKey, type FlipRun } from "./flipRun";
import type { OwnedFind } from "./ownedFind";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { dispatchAll, newTestGame, settleStories, withActiveGig, withFind } from "./testPlaythrough";
import { maxPull } from "./tolerance";
import {
  ASSIST_UNPICK_CAP,
  isLineDone,
  lineAccuracy,
  lineRecord,
  savedNotions,
  snagLoss,
  unpickAccuracy,
} from "./unpick";
import { findById } from "./catalog";
import type { FindId } from "../content/find";

function atUnpick(findId: FindId, base: GameState = settleStories(newTestGame())): GameState {
  const withGig = withFind(withActiveGig(base, "nana-bea"), findId);
  const findKey = withGig.stock.finds[withGig.stock.finds.length - 1]?.id ?? "";
  return dispatchAll(withGig, [
    { type: "startFlip", gigId: withGig.gigs.active[0]?.id ?? "" },
    { type: "goToStage", stage: "design" },
    { type: "chooseRecipe", recipeId: "cushion-cover" },
    { type: "goToStage", stage: "market" },
    { type: "chooseFinds", findIds: [findKey] },
    { type: "goToStage", stage: "unpick" },
  ]);
}

function runOf(state: GameState): FlipRun {
  if (state.activeRun === null) throw new Error("No run");
  return state.activeRun;
}

function firstFind(run: FlipRun): OwnedFind {
  const owned = run.finds[0];
  if (owned === undefined) throw new Error("No find");
  return owned;
}

function findKeyOf(state: GameState): string {
  return state.activeRun?.finds[0]?.id ?? "";
}

describe("snip old stitches", () => {
  it("uses a tighter pull on delicate fabric", () => {
    const state = newTestGame();
    expect(maxPull(state, "cotton")).toBeCloseTo(3.8, 5);
    expect(maxPull(state, "silk")).toBeCloseTo(2.6, 5);
    expect(maxPull({ ...state, upgrades: ["sharp-ripper"] }, "cotton")).toBeCloseTo(3.8 * 1.15, 5);
    expect(
      maxPull({ ...state, profile: { ...state.profile, trait: "perfectionist" } }, "cotton"),
    ).toBeCloseTo(3.8 * 1.2, 5);
    expect(maxPull({ ...state, profile: { ...state.profile, difficulty: "relaxed" } }, "cotton")).toBeCloseTo(
      3.8 * 1.3,
      5,
    );
    expect(
      maxPull({ ...state, profile: { ...state.profile, difficulty: "challenging" } }, "cotton"),
    ).toBeCloseTo(3.8 * 0.85, 5);
  });

  it("pops on a clean pull, ignores a tiny tug and snags a greedy drag", () => {
    const state = atUnpick("linen-curtain");
    const findKey = findKeyOf(state);
    const pull = (stitch: number, distanceCm: number) =>
      ({ type: "pullStitch", findKey, line: 1, stitch, distanceCm, assisted: false }) as const;
    expect(reduce(state, pull(0, 0.5))).toBe(state);
    const popped = reduce(state, pull(0, 2));
    const snagged = reduce(popped, pull(1, 9));
    const run = snagged.activeRun;
    if (run === null) throw new Error("No run");
    const record = lineRecord(run, findKey, 1);
    expect(record.popped).toEqual([0]);
    expect(record.snagsAt).toEqual([1]);
    expect(record.attempts).toBe(2);
    expect(reduce(snagged, pull(0, 2))).toBe(snagged);
    const line = findById("linen-curtain").lines[1];
    if (line === undefined) throw new Error("No line");
    expect(lineAccuracy(line, record)).toBe(0.5);
  });

  it("lets a line come loose after three tries per stitch, counting the rest as snags", () => {
    let state = atUnpick("sailor-top");
    const findKey = findKeyOf(state);
    const def = findById("sailor-top").lines[0];
    if (def === undefined) throw new Error("No line");
    state = reduce(state, {
      type: "pullStitch",
      findKey,
      line: 0,
      stitch: 0,
      distanceCm: 2,
      assisted: false,
    });
    for (let attempt = 0; attempt < 3 * def.stitches - 1; attempt += 1)
      state = reduce(state, {
        type: "pullStitch",
        findKey,
        line: 0,
        stitch: 1,
        distanceCm: 20,
        assisted: false,
      });
    const run = state.activeRun;
    if (run === null) throw new Error("No run");
    const record = lineRecord(run, findKey, 0);
    expect(isLineDone(def, record)).toBe(true);
    expect(lineAccuracy(def, record)).toBeCloseTo(1 / (1 + 23 + 7), 5);
    expect(snagLoss(run, firstFind(run))).toBe(0.1);
  });

  it("caps assisted lines at 0.7 and never snags", () => {
    let state = atUnpick("sailor-top");
    const findKey = findKeyOf(state);
    for (const [line, def] of findById("sailor-top").lines.entries())
      for (let stitch = 0; stitch < def.stitches; stitch += 1)
        state = reduce(state, { type: "pullStitch", findKey, line, stitch, distanceCm: 0, assisted: true });
    const run = state.activeRun;
    if (run === null) throw new Error("No run");
    expect(unpickAccuracy(run)).toBe(ASSIST_UNPICK_CAP);
    expect(run.unpick[lineKey(findKey, 0)]?.snagsAt).toEqual([]);
  });

  it("saves a button on a clean pop and loses it on a snag, unless the sharp ripper helps once", () => {
    const base = atUnpick("faded-jeans");
    const findKey = findKeyOf(base);
    const buttonLine = 2;
    const pull = (distanceCm: number) =>
      ({ type: "pullStitch", findKey, line: buttonLine, stitch: 2, distanceCm, assisted: false }) as const;
    const clean = reduce(base, pull(2));
    expect(savedNotions(runOf(clean), false)).toEqual(["button"]);
    const snagThenPop = dispatchAll(base, [pull(20), pull(2)]);
    expect(savedNotions(runOf(snagThenPop), false)).toEqual([]);
    expect(savedNotions(runOf(snagThenPop), true)).toEqual(["button"]);
    const twoSnags = dispatchAll(base, [pull(20), pull(20), pull(2)]);
    expect(savedNotions(runOf(twoSnags), true)).toEqual([]);
  });

  it("refuses pulls outside the unpick step or on unknown stitches with the same state", () => {
    const state = atUnpick("sailor-top");
    const findKey = findKeyOf(state);
    expect(
      reduce(state, { type: "pullStitch", findKey, line: 9, stitch: 0, distanceCm: 2, assisted: false }),
    ).toBe(state);
    expect(
      reduce(state, {
        type: "pullStitch",
        findKey: "nope",
        line: 0,
        stitch: 0,
        distanceCm: 2,
        assisted: false,
      }),
    ).toBe(state);
    expect(
      reduce(state, { type: "pullStitch", findKey, line: 0, stitch: 99, distanceCm: 2, assisted: false }),
    ).toBe(state);
    expect(
      reduce(state, {
        type: "pullStitch",
        findKey,
        line: 0,
        stitch: 0,
        distanceCm: Number.NaN,
        assisted: false,
      }),
    ).toBe(state);
    const hub = settleStories(newTestGame());
    expect(
      reduce(hub, { type: "pullStitch", findKey, line: 0, stitch: 0, distanceCm: 2, assisted: false }),
    ).toBe(hub);
  });
});
