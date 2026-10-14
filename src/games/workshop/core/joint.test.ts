import { describe, expect, it } from "vitest";
import {
  ASSIST_JOINT_ACCURACY_CAP,
  gateValue,
  isMalletReady,
  jointAccuracy,
  jointError,
  jointStartPose,
  MIN_START_OFFSET_MM,
  SPLAYED_SLOT_ANGLE_DEG,
} from "./joint";
import { reduce } from "./reduce";
import {
  BIRDHOUSE_PLAN,
  dispatchAll,
  newTestGame,
  playUntil,
  runOf,
  settleStories,
  withActiveGig,
  lastGigId,
} from "./testPlaythrough";
import { jointTolerance } from "./tolerance";
import type { GameState } from "./gameState";

const TOL = { offsetMm: 4, angleDeg: 5 };

function atJoin(state: GameState): GameState {
  return playUntil(state, lastGigId(state), BIRDHOUSE_PLAN, "join");
}

describe("joint fitting", () => {
  it("scores a perfect fit with every good tap as 1", () => {
    expect(jointAccuracy({ offsetMm: 0, angleDeg: 0 }, TOL, 3, 3)).toBe(1);
  });

  it("makes nearly right feel generous: half-way off on both scores 0.75", () => {
    expect(jointAccuracy({ offsetMm: 2, angleDeg: 2.5 }, TOL, 3, 3)).toBeCloseTo(0.75);
  });

  it("lets missed taps cost at most a tenth", () => {
    expect(jointAccuracy({ offsetMm: 0, angleDeg: 0 }, TOL, 0, 3)).toBeCloseTo(0.9);
  });

  it("opens the mallet gate exactly at the tolerance ellipse", () => {
    expect(isMalletReady({ offsetMm: 4, angleDeg: 0 }, TOL)).toBe(true);
    expect(isMalletReady({ offsetMm: 0, angleDeg: 5 }, TOL)).toBe(true);
    expect(isMalletReady({ offsetMm: 4.01, angleDeg: 0 }, TOL)).toBe(false);
    expect(gateValue({ offsetMm: 2 * Math.SQRT1_2 * 2, angleDeg: 0 }, TOL)).toBeCloseTo(0.5);
    expect(isMalletReady({ offsetMm: 3, angleDeg: 3.5 }, TOL)).toBe(false);
    expect(jointAccuracy({ offsetMm: 4, angleDeg: 0 }, TOL, 0, 3)).toBeCloseTo(0.45);
  });

  it("measures offset and turn from the reported pose", () => {
    expect(jointError({ x: 3, y: 4, angle: 10 }, 8)).toEqual({ offsetMm: 5, angleDeg: 2 });
    expect(jointError({ x: 0, y: 0, angle: 359 }, 0).angleDeg).toBeCloseTo(1);
  });

  it("never starts a part inside the tolerance", () => {
    for (let index = 0; index < 40; index += 1) {
      const pose = jointStartPose(`run-${index + 1}`, index % 6, 0);
      const error = jointError(pose, 0);
      expect(error.offsetMm).toBeGreaterThanOrEqual(MIN_START_OFFSET_MM - 0.1);
      expect(error.angleDeg).toBeGreaterThanOrEqual(12 - 0.1);
      expect(error.angleDeg).toBeLessThanOrEqual(25 + 0.1);
    }
    expect(jointStartPose("run-3", 1, 0)).toEqual(jointStartPose("run-3", 1, 0));
  });

  it("matches the documented tolerances for pine and oak", () => {
    const standard = newTestGame();
    const peg = jointTolerance(standard, "pine", "peg");
    expect(peg.offsetMm).toBeCloseTo(4.8);
    const challenging = newTestGame({ difficulty: "challenging" });
    expect(jointTolerance(challenging, "oak", "comb").offsetMm).toBeCloseTo(1.938, 2);
  });

  it("records a seated joint, caps assisted ones and lets a joint be redone", () => {
    const state = atJoin(withActiveGig(settleStories(newTestGame()), "grandpa-teodor"));
    const seated = reduce(state, {
      type: "seatJoint",
      jointId: "peg-1",
      pose: { x: 0, y: 0, angle: 0 },
      goodTaps: 2,
      assisted: false,
    });
    expect(runOf(seated).joints["peg-1"]?.accuracy).toBe(1);
    expect(
      reduce(seated, {
        type: "seatJoint",
        jointId: "peg-1",
        pose: { x: 0, y: 0, angle: 0 },
        goodTaps: 2,
        assisted: false,
      }),
    ).toBe(seated);
    const assisted = reduce(state, {
      type: "seatJoint",
      jointId: "peg-2",
      pose: { x: 30, y: 30, angle: 20 },
      goodTaps: 2,
      assisted: true,
    });
    expect(runOf(assisted).joints["peg-2"]?.accuracy).toBe(ASSIST_JOINT_ACCURACY_CAP);
    const redone = reduce(seated, { type: "resetJoint", jointId: "peg-1" });
    expect(runOf(redone).joints["peg-1"]).toBeUndefined();
  });

  it("refuses records outside the gate or with impossible taps", () => {
    const state = atJoin(withActiveGig(settleStories(newTestGame()), "grandpa-teodor"));
    const bad = [
      { pose: { x: 20, y: 0, angle: 0 }, goodTaps: 2 },
      { pose: { x: 0, y: 0, angle: 0 }, goodTaps: 3 },
      { pose: { x: 0, y: 0, angle: 0 }, goodTaps: -1 },
      { pose: { x: 0, y: 0, angle: 0 }, goodTaps: 1.5 },
      { pose: { x: Number.NaN, y: 0, angle: 0 }, goodTaps: 1 },
    ];
    for (const entry of bad)
      expect(dispatchAll(state, [{ type: "seatJoint", jointId: "peg-1", assisted: false, ...entry }])).toBe(
        state,
      );
    expect(
      reduce(state, {
        type: "seatJoint",
        jointId: "ghost",
        pose: { x: 0, y: 0, angle: 0 },
        goodTaps: 1,
        assisted: false,
      }),
    ).toBe(state);
  });

  it("tilts slot joints when the legs are splayed", () => {
    expect(SPLAYED_SLOT_ANGLE_DEG).toBe(8);
  });
});
