import { describe, expect, it } from "vitest";
import type { DifficultyId } from "../../../engine/difficulty";
import type { TraitId } from "../../../engine/trait";
import { STONE_CUTS } from "../content/stone";
import type { UpgradeId } from "../content/upgrade";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import {
  angleOff,
  clawCount,
  clawScore,
  isSeated,
  seatDistance,
  seatFit,
  setAccuracy,
  setTolerance,
  startPose,
} from "./stoneSetting";
import { GOOD_PLAN, lastGigId, newTestGame, playRunTo, settleStories, withOrder } from "./testPlaythrough";

function skill(difficulty: DifficultyId, trait: TraitId = "dreamer", upgrades: UpgradeId[] = []) {
  return { profile: { ...newTestGame().profile, difficulty, trait }, upgrades };
}

function atSet(clientId = "gran-mina", stoneId: "garnet" | "sea-glass" = "garnet"): GameState {
  const ordered = withOrder(settleStories(newTestGame()), clientId);
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  return playRunTo(started, { ...GOOD_PLAN, stoneId }, "set");
}

const STANDARD = setTolerance(skill("standard"));

describe("stone tolerances", () => {
  it("scale distance, angle and claw band by trait, Magnifier Stand and difficulty", () => {
    expect(STANDARD).toEqual({ distance: 0.8, angle: 8, band: 0.07 });
    const helped = setTolerance(skill("relaxed", "perfectionist", ["magnifier"]));
    expect(helped.distance).toBeCloseTo(0.8 * 1.2 * 1.15 * 1.3);
    expect(helped.band).toBeCloseTo(0.07 * 1.2 * 1.15 * 1.3);
    expect(setTolerance(skill("challenging")).angle).toBeCloseTo(6.8);
  });
});

describe("start pose", () => {
  it("is 3 to 5 mm away, turned 15 to 30 degrees for shaped stones, and never already seated", () => {
    for (let seed = 1; seed < 200; seed += 7)
      for (const cut of STONE_CUTS) {
        const pose = startPose(seed, seed % 2, cut);
        expect(seatDistance(pose)).toBeGreaterThanOrEqual(2.98);
        expect(seatDistance(pose)).toBeLessThanOrEqual(5.02);
        if (cut === "round") expect(pose.rotation).toBe(0);
        else expect(Math.abs(pose.rotation)).toBeGreaterThanOrEqual(15);
        expect(Math.abs(pose.rotation)).toBeLessThanOrEqual(30);
        expect(isSeated(pose, cut, setTolerance(skill("relaxed", "perfectionist", ["magnifier"])))).toBe(
          false,
        );
        expect(startPose(seed, seed % 2, cut)).toEqual(pose);
      }
  });
});

describe("seat gate and claws", () => {
  it("uses an ellipse of distance and angle, and ignores angle for round stones", () => {
    expect(isSeated({ x: 0.79, y: 0, rotation: 0 }, "oval", STANDARD)).toBe(true);
    expect(isSeated({ x: 0.6, y: 0, rotation: 6 }, "oval", STANDARD)).toBe(false);
    expect(isSeated({ x: 0.6, y: 0, rotation: 6 }, "round", STANDARD)).toBe(true);
    expect(isSeated({ x: 0, y: 0, rotation: 90 }, "square", STANDARD)).toBe(true);
    expect(isSeated({ x: 0, y: 0, rotation: 180 }, "teardrop", STANDARD)).toBe(false);
    expect(angleOff(178, "oval")).toBe(2);
    expect(angleOff(-3, "square")).toBe(3);
  });

  it("scores claws 1 inside the snug band and falls to 0 over the next 0.15", () => {
    expect(clawScore(0.8, 0.07)).toBe(1);
    expect(clawScore(0.87, 0.07)).toBe(1);
    expect(clawScore(0.73, 0.07)).toBe(1);
    expect(clawScore(0.945, 0.07)).toBeCloseTo(0.5);
    expect(clawScore(1.02, 0.07)).toBeCloseTo(0);
    expect(clawScore(1.1, 0.07)).toBe(0);
    expect(clawScore(0, 0.07)).toBe(0);
    expect(clawCount("teardrop")).toBe(3);
    expect(clawCount("oval")).toBe(4);
  });

  it("averages seat fit and claws, capped at 0.8 with the gentle tweezers", () => {
    const pose = { x: 0.4, y: 0, rotation: 0 };
    expect(seatFit(pose, "round", STANDARD)).toBeCloseTo(1 - 0.5 * 0.25);
    expect(setAccuracy(pose, [0.8, 0.8, 0.8, 0.5], "round", STANDARD, false)).toBeCloseTo(
      0.5 * (1 - 0.125) + 0.5 * ((3 + 0) / 4),
    );
    expect(setAccuracy({ x: 0, y: 0, rotation: 0 }, [0.8, 0.8, 0.8, 0.8], "round", STANDARD, true)).toBe(0.8);
  });
});

describe("setting a stone", () => {
  it("records a seated stone, takes the stones once and lets the player redo it", () => {
    const state = atSet();
    const stones = state.stock.stones.garnet;
    const set = reduce(state, {
      type: "setStone",
      seatKey: "seat",
      x: 0.2,
      y: 0.1,
      rotation: 0,
      claws: [0.8, 0.8, 0.8, 0.8],
      assisted: false,
    });
    expect(set.activeRun?.sets.seat?.accuracy).toBeGreaterThan(0.95);
    expect(set.stock.stones.garnet).toBe(stones - 1);
    const redo = reduce(set, {
      type: "setStone",
      seatKey: "seat",
      x: 0,
      y: 0,
      rotation: 0,
      claws: [0.9, 0.9, 0.9, 0.9],
      assisted: false,
    });
    expect(redo.activeRun?.sets.seat?.claws).toEqual([0.9, 0.9, 0.9, 0.9]);
    expect(redo.stock.stones.garnet).toBe(stones - 1);
    const same = reduce(redo, {
      type: "setStone",
      seatKey: "seat",
      x: 0,
      y: 0,
      rotation: 0,
      claws: [0.9, 0.9, 0.9, 0.9],
      assisted: false,
    });
    expect(same).toBe(redo);
  });

  it("refuses a stone outside the gate, the wrong claw count, or a claw pushed too far", () => {
    const state = atSet();
    const claws = [0.8, 0.8, 0.8, 0.8];
    expect(
      reduce(state, { type: "setStone", seatKey: "seat", x: 2, y: 0, rotation: 0, claws, assisted: false }),
    ).toBe(state);
    expect(
      reduce(state, {
        type: "setStone",
        seatKey: "seat",
        x: 0,
        y: 0,
        rotation: 0,
        claws: [0.8, 0.8, 0.8],
        assisted: false,
      }),
    ).toBe(state);
    expect(
      reduce(state, {
        type: "setStone",
        seatKey: "seat",
        x: 0,
        y: 0,
        rotation: 0,
        claws: [0.8, 0.8, 0.8, 1.3],
        assisted: false,
      }),
    ).toBe(state);
    expect(
      reduce(state, { type: "setStone", seatKey: "nope", x: 0, y: 0, rotation: 0, claws, assisted: false }),
    ).toBe(state);
    expect(
      reduce(state, {
        type: "setStone",
        seatKey: "seat",
        x: Number.NaN,
        y: 0,
        rotation: 0,
        claws,
        assisted: false,
      }),
    ).toBe(state);
  });

  it("checks the angle for shaped stones", () => {
    const state = atSet("gran-mina", "sea-glass");
    const claws = [0.8, 0.8, 0.8, 0.8];
    expect(
      reduce(state, { type: "setStone", seatKey: "seat", x: 0, y: 0, rotation: 12, claws, assisted: false }),
    ).toBe(state);
    expect(
      reduce(state, { type: "setStone", seatKey: "seat", x: 0, y: 0, rotation: 182, claws, assisted: false }),
    ).not.toBe(state);
  });
});
