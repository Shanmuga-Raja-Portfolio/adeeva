import { describe, expect, it } from "vitest";
import { followAccuracy } from "../../../engine/followRecord";
import { mixById } from "./catalog";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { isInStirBand, isStirring, lapDirection, stirHalfWidth } from "./stir";
import { GOOD_PLAN, lastGigId, newTestGame, playRunTo, settleStories, withOrder } from "./testPlaythrough";

function atMix(): GameState {
  const start = withOrder(settleStories(newTestGame()), "pip");
  const started = reduce(start, { type: "startOrder", gigId: lastGigId(start) });
  return playRunTo(
    started,
    {
      ...GOOD_PLAN,
      productId: "cupcake-tray",
      mixIds: ["vanilla-sponge"],
      fillingId: null,
      colours: ["sky"],
    },
    "mix",
  );
}

describe("stirring", () => {
  it("narrows the green band for stiff mixes on Standard", () => {
    const standard = newTestGame();
    expect(stirHalfWidth(standard, mixById("vanilla-sponge"), false)).toBeCloseTo(0.88);
    expect(stirHalfWidth(standard, mixById("biscuit-dough"), false)).toBeCloseTo(0.68);
    expect(
      stirHalfWidth(newTestGame({ difficulty: "relaxed" }), mixById("vanilla-sponge"), false),
    ).toBeCloseTo(1.144);
    expect(stirHalfWidth(standard, mixById("vanilla-sponge"), true)).toBeCloseTo(1.408);
    expect(
      stirHalfWidth(newTestGame({ trait: "perfectionist" }), mixById("vanilla-sponge"), false),
    ).toBeCloseTo(1.056);
  });

  it("counts a steady spoon inside the band and a wild one outside", () => {
    expect(isInStirBand(3.5, 0.88)).toBe(true);
    expect(isInStirBand(-3.5, 0.88)).toBe(true);
    expect(isInStirBand(4.5, 0.88)).toBe(false);
    expect(isInStirBand(2.5, 0.88)).toBe(false);
    expect(isStirring(0.4)).toBe(false);
    expect(lapDirection(0)).toBe(1);
    expect(lapDirection(1.5)).toBe(-1);
  });

  it("records laps that only move forward within the tick bounds", () => {
    const state = atMix();
    const first = reduce(state, {
      type: "recordStir",
      batch: 0,
      progress: 1,
      ticks: 100,
      insideTicks: 90,
      assisted: false,
    });
    expect(first).not.toBe(state);
    expect(
      reduce(first, {
        type: "recordStir",
        batch: 0,
        progress: 0.5,
        ticks: 150,
        insideTicks: 95,
        assisted: false,
      }),
    ).toBe(first);
    expect(
      reduce(state, {
        type: "recordStir",
        batch: 0,
        progress: 1,
        ticks: 30,
        insideTicks: 20,
        assisted: false,
      }),
    ).toBe(state);
    expect(
      reduce(state, {
        type: "recordStir",
        batch: 0,
        progress: 1,
        ticks: 1300,
        insideTicks: 20,
        assisted: false,
      }),
    ).toBe(state);
    expect(
      reduce(state, {
        type: "recordStir",
        batch: 0,
        progress: 1,
        ticks: 100,
        insideTicks: 101,
        assisted: false,
      }),
    ).toBe(state);
    expect(
      reduce(state, {
        type: "recordStir",
        batch: 0,
        progress: 4,
        ticks: 400,
        insideTicks: 300,
        assisted: false,
      }),
    ).toBe(state);
    const assisted = reduce(first, {
      type: "recordStir",
      batch: 0,
      progress: 3,
      ticks: 300,
      insideTicks: 290,
      assisted: true,
    });
    const stir = assisted.activeRun?.batches[0]?.stir;
    expect(stir?.progress).toBe(3);
    expect(stir === null || stir === undefined ? 0 : followAccuracy(stir)).toBe(0.8);
  });
});
