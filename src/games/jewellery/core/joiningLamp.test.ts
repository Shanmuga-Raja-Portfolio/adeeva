import { describe, expect, it } from "vitest";
import type { DifficultyId } from "../../../engine/difficulty";
import type { TraitId } from "../../../engine/trait";
import type { UpgradeId } from "../content/upgrade";
import type { GameState } from "./gameState";
import {
  COLD_LAMP,
  isJoinDone,
  joinAccuracy,
  joinZone,
  lampTick,
  warmthBand,
  warmthStep,
  type LampState,
} from "./joiningLamp";
import { runJoints } from "./joinRecord";
import { reduce } from "./reduce";
import { GOOD_PLAN, lastGigId, newTestGame, playRunTo, settleStories, withOrder } from "./testPlaythrough";

function skill(difficulty: DifficultyId, trait: TraitId = "dreamer", upgrades: UpgradeId[] = []) {
  return { profile: { ...newTestGame().profile, difficulty, trait }, upgrades };
}

function atJoin(clientId = "gran-mina"): GameState {
  const ordered = withOrder(settleStories(newTestGame()), clientId);
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  return playRunTo(started, GOOD_PLAN, "join");
}

function runOf(state: GameState) {
  if (state.activeRun === null) throw new Error("no run");
  return state.activeRun;
}

function pulse(warmRate: number, difficulty: DifficultyId, lateTicks: number, need: number): LampState {
  const zone = joinZone(skill(difficulty));
  let lamp = COLD_LAMP;
  let holding = true;
  let late = 0;
  for (let tick = 0; tick < 3600 && lamp.insideTicks < need; tick += 1) {
    if (holding && lamp.warmth >= zone.to) late += 1;
    if (holding && late > lateTicks) {
      holding = false;
      late = 0;
    }
    if (!holding && lamp.warmth < zone.from + 0.01) holding = true;
    lamp = lampTick(lamp, holding, warmRate, zone);
  }
  return lamp;
}

describe("the gold zone", () => {
  it("starts at 0.70 and widens with difficulty, trait and the Gentle Lamp", () => {
    expect(joinZone(skill("standard"))).toEqual({ from: 0.7, to: 0.85 });
    expect(joinZone(skill("relaxed")).to - 0.7).toBeCloseTo(0.195);
    expect(joinZone(skill("challenging")).to - 0.7).toBeCloseTo(0.1275);
    expect(joinZone(skill("standard", "perfectionist")).to - 0.7).toBeCloseTo(0.18);
    expect(joinZone(skill("standard", "dreamer", ["gentle-lamp"])).to - 0.7).toBeCloseTo(0.1725);
  });

  it("classifies warmth at the zone edges", () => {
    const zone = joinZone(skill("standard"));
    expect(warmthBand(0.6999, zone)).toBe("below");
    expect(warmthBand(0.7, zone)).toBe("inside");
    expect(warmthBand(0.85, zone)).toBe("inside");
    expect(warmthBand(0.8501, zone)).toBe("over");
  });
});

describe("warming and cooling", () => {
  it("warms at the metal's rate and cools at 0.30 a second, staying between 0 and 1", () => {
    expect(warmthStep(0, true, 0.35)).toBeCloseTo(0.35 / 60);
    expect(warmthStep(0.5, false, 0.45)).toBeCloseTo(0.5 - 0.3 / 60);
    expect(warmthStep(0, false, 0.35)).toBe(0);
    expect(warmthStep(0.999, true, 0.45)).toBe(1);
  });

  it("starts counting at the first tick inside the zone", () => {
    const zone = joinZone(skill("standard"));
    let lamp = COLD_LAMP;
    for (let tick = 0; tick < 60; tick += 1) lamp = lampTick(lamp, true, 0.35, zone);
    expect(lamp.ticks).toBe(0);
    for (let tick = 0; tick < 70; tick += 1) lamp = lampTick(lamp, true, 0.35, zone);
    expect(lamp.ticks).toBeGreaterThan(0);
    expect(lamp.insideTicks + lamp.overTicks).toBe(lamp.ticks);
  });

  it("rewards a quick, steady rhythm and punishes overheating", () => {
    const careful = pulse(0.35, "standard", 2, 240);
    expect(isJoinDone({ ...careful, assisted: false, twin: false }, 240)).toBe(true);
    const carefulScore = joinAccuracy({ ...careful, assisted: false, twin: false });
    expect(carefulScore).toBeGreaterThan(0.8);
    const late = joinAccuracy({ ...pulse(0.35, "standard", 12, 240), assisted: false, twin: false });
    expect(late).toBeLessThan(carefulScore);
    expect(late).toBeGreaterThan(0.3);
    const fastSilver = joinAccuracy({ ...pulse(0.45, "challenging", 12, 240), assisted: false, twin: false });
    expect(fastSilver).toBeLessThan(late);
    const relaxed = joinAccuracy({ ...pulse(0.35, "relaxed", 12, 240), assisted: false, twin: false });
    expect(relaxed).toBeGreaterThan(late);
  });

  it("scores 1 − 1.5 × over ÷ counted, capped at 0.8 with the steady lamp", () => {
    expect(
      joinAccuracy({ ticks: 300, insideTicks: 240, overTicks: 20, assisted: false, twin: false }),
    ).toBeCloseTo(1 - (1.5 * 20) / 260);
    expect(joinAccuracy({ ticks: 240, insideTicks: 240, overTicks: 0, assisted: true, twin: false })).toBe(
      0.8,
    );
    expect(joinAccuracy({ ticks: 300, insideTicks: 100, overTicks: 200, assisted: false, twin: false })).toBe(
      0,
    );
  });
});

describe("recording a seam", () => {
  it("needs 300 glowing ticks for a ring seam and 240 for the rest", () => {
    const ring = withOrder(settleStories(newTestGame()), "dev");
    const started = reduce(ring, { type: "startOrder", gigId: lastGigId(ring) });
    expect(runJoints(runOf(started)).map((joint) => joint.ticks)).toEqual([300]);
    expect(runJoints(runOf(atJoin())).map((joint) => joint.ticks)).toEqual([240, 240]);
  });

  it("accepts growing counts and refuses shrinking, impossible or finished ones", () => {
    const state = atJoin();
    const first = reduce(state, {
      type: "recordJoin",
      jointId: "seat",
      ticks: 100,
      insideTicks: 80,
      overTicks: 10,
      assisted: false,
    });
    expect(first.activeRun?.joins.seat).toEqual({
      ticks: 100,
      insideTicks: 80,
      overTicks: 10,
      assisted: false,
      twin: false,
    });
    expect(
      reduce(first, {
        type: "recordJoin",
        jointId: "seat",
        ticks: 90,
        insideTicks: 85,
        overTicks: 0,
        assisted: false,
      }),
    ).toBe(first);
    expect(
      reduce(first, {
        type: "recordJoin",
        jointId: "seat",
        ticks: 120,
        insideTicks: 70,
        overTicks: 10,
        assisted: false,
      }),
    ).toBe(first);
    expect(
      reduce(state, {
        type: "recordJoin",
        jointId: "seat",
        ticks: 10,
        insideTicks: 8,
        overTicks: 5,
        assisted: false,
      }),
    ).toBe(state);
    expect(
      reduce(state, {
        type: "recordJoin",
        jointId: "seat",
        ticks: 3601,
        insideTicks: 240,
        overTicks: 0,
        assisted: false,
      }),
    ).toBe(state);
    expect(
      reduce(state, {
        type: "recordJoin",
        jointId: "seat",
        ticks: 2.5,
        insideTicks: 1,
        overTicks: 0,
        assisted: false,
      }),
    ).toBe(state);
    expect(
      reduce(state, {
        type: "recordJoin",
        jointId: "nope",
        ticks: 10,
        insideTicks: 8,
        overTicks: 0,
        assisted: false,
      }),
    ).toBe(state);
    const done = reduce(first, {
      type: "recordJoin",
      jointId: "seat",
      ticks: 300,
      insideTicks: 260,
      overTicks: 10,
      assisted: true,
    });
    expect(done.activeRun?.joins.seat?.assisted).toBe(true);
    expect(
      reduce(done, {
        type: "recordJoin",
        jointId: "seat",
        ticks: 400,
        insideTicks: 300,
        overTicks: 10,
        assisted: false,
      }),
    ).toBe(done);
    expect(reduce(done, { type: "restartJoin", jointId: "seat" })).toBe(done);
  });

  it("restarts only the unfinished seam", () => {
    const state = reduce(atJoin(), {
      type: "recordJoin",
      jointId: "loop",
      ticks: 60,
      insideTicks: 40,
      overTicks: 0,
      assisted: false,
    });
    const restarted = reduce(state, { type: "restartJoin", jointId: "loop" });
    expect(restarted.activeRun?.joins.loop).toBeUndefined();
    expect(reduce(restarted, { type: "restartJoin", jointId: "loop" })).toBe(restarted);
  });
});
