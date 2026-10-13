import { describe, expect, it } from "vitest";
import { mixById } from "./catalog";
import type { GameState } from "./gameState";
import {
  autoOutMinutes,
  bakeAccuracy,
  bakeWindow,
  colourStop,
  doneTime,
  evenScore,
  heatScore,
  timingScore,
} from "./oven";
import { reduce } from "./reduce";
import { GOOD_PLAN, lastGigId, newTestGame, playRunTo, settleStories, withOrder } from "./testPlaythrough";

const sponge = mixById("vanilla-sponge");

function atBake(): GameState {
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
    "bake",
  );
}

describe("the oven", () => {
  it("names the five colour stops", () => {
    expect(colourStop(0.5)).toBe("pale");
    expect(colourStop(0.85)).toBe("light");
    expect(colourStop(1)).toBe("golden");
    expect(colourStop(1.06)).toBe("golden");
    expect(colourStop(1.2)).toBe("deep");
    expect(colourStop(1.3)).toBe("toasty");
  });

  it("bakes faster when hotter and reads the heat dots", () => {
    expect(doneTime(sponge, 3)).toBe(24);
    expect(doneTime(sponge, 4)).toBeCloseTo(20.16);
    expect(doneTime(sponge, 2)).toBeCloseTo(27.84);
    expect(heatScore(sponge, 3)).toBe(1);
    expect(heatScore(sponge, 4)).toBeCloseTo(0.4);
    expect(heatScore(sponge, 5)).toBe(0);
  });

  it("gives a golden window that matches each difficulty", () => {
    const standard = bakeWindow(newTestGame());
    expect(standard).toBeCloseTo(0.06);
    expect(24 * (1 - standard)).toBeCloseTo(22.56);
    expect(24 * (1 + standard)).toBeCloseTo(25.44);
    expect(bakeWindow(newTestGame({ difficulty: "relaxed" }))).toBeCloseTo(0.078);
    expect(bakeWindow(newTestGame({ difficulty: "challenging" }))).toBeCloseTo(0.051);
    expect(bakeWindow({ ...newTestGame(), upgrades: ["oven-lamp"] })).toBeCloseTo(0.072);
    expect(timingScore(1.16, 0.06)).toBeCloseTo(0.6);
  });

  it("rewards a turn near the middle of the bake", () => {
    expect(evenScore(sponge, 3, 12)).toBe(1);
    expect(evenScore(sponge, 3, 15)).toBe(1);
    expect(evenScore(sponge, 3, 16)).toBe(0.6);
    expect(evenScore(sponge, 3, null)).toBe(0.6);
  });

  it("takes the bake out by itself at twice the done time, toasty", () => {
    expect(autoOutMinutes(sponge, 3)).toBe(48);
    const toasty = bakeAccuracy(
      { heat: 3, turnedMinutes: 12, takenMinutes: 48, assisted: false },
      sponge,
      0.06,
    );
    expect(colourStop(48 / 24)).toBe("toasty");
    expect(toasty).toBeCloseTo(0.4);
    expect(bakeAccuracy({ heat: 3, turnedMinutes: 12, takenMinutes: 24, assisted: true }, sponge, 0.06)).toBe(
      0.8,
    );
  });

  it("commits each batch once and refuses impossible timings", () => {
    const state = atBake();
    const record = {
      type: "bakeBatch" as const,
      batch: 0,
      heat: 3,
      turnedMinutes: 12,
      takenMinutes: 24,
      assisted: false,
    };
    const baked = reduce(state, record);
    expect(baked.activeRun?.batches[0]?.bake).toEqual({
      heat: 3,
      turnedMinutes: 12,
      takenMinutes: 24,
      assisted: false,
      window: bakeWindow(state),
    });
    expect(reduce(baked, record)).toBe(baked);
    for (const bad of [
      { heat: 0 },
      { heat: 6 },
      { takenMinutes: 49 },
      { takenMinutes: 0 },
      { turnedMinutes: 24 },
      { turnedMinutes: 0 },
      { takenMinutes: 23.5 },
    ])
      expect(reduce(state, { ...record, ...bad })).toBe(state);
  });
});
