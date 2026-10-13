import { describe, expect, it } from "vitest";
import { GARMENT_PARTS } from "../content/garmentPart";
import type { SeamProgress } from "./dressRun";
import { snapshotRun } from "./dressSnapshot";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { requiredSeams } from "./requiredSeams";
import { ASSIST_SEW_ACCURACY_CAP, seamAccuracy } from "./seamAccuracy";
import { isNeedleOnLine, seamLineAt } from "./seamLine";
import { MAX_TICKS_PER_SEAM, MIN_TICKS_PER_SEAM } from "./sewing";
import { assembleToSew, layoutAndCut, newTestGame, sketchAndShop, withActiveGig } from "./testPlaythrough";

function atSewingMachine(): GameState {
  const base = withActiveGig(newTestGame(), "mom");
  const gig = base.gigs.active[0];
  if (gig === undefined) throw new Error("expected a gig");
  return assembleToSew(layoutAndCut(sketchAndShop(reduce(base, { type: "startRun", gigId: gig.id }))));
}

function seamResult(state: GameState, seamId: string) {
  const run = state.activeRun;
  if (run === null) throw new Error("expected a run");
  return snapshotRun(run).seams.find((entry) => entry.seamId === seamId);
}

function sew(state: GameState, seamId: string, sample: SeamProgress): GameState {
  return reduce(state, { type: "recordSeam", seamId, ...sample });
}

function firstSeamId(state: GameState): string {
  const run = state.activeRun;
  const seam = run === null ? undefined : requiredSeams(run.design)[0];
  if (seam === undefined) throw new Error("expected a seam");
  return seam.seam.id;
}

describe("needle on the line", () => {
  it("follows the eased seam profile", () => {
    const profile = [0, 1, 0];
    expect(seamLineAt(profile, 0)).toBe(0);
    expect(seamLineAt(profile, 0.25)).toBeCloseTo(0.5);
    expect(seamLineAt(profile, 0.5)).toBe(1);
    expect(seamLineAt(profile, 2)).toBe(0);
    expect(seamLineAt([], 0.5)).toBe(0);
  });

  it("counts the needle inside the band against the line under it", () => {
    const profile = [0, 1, 0];
    expect(isNeedleOnLine(profile, 0.5, -1, 0.1)).toBe(true);
    expect(isNeedleOnLine(profile, 0.5, -0.85, 0.1)).toBe(false);
    expect(isNeedleOnLine(profile, 0, 0.1, 0.1)).toBe(true);
    expect(isNeedleOnLine(profile, 0, 0.11, 0.1)).toBe(false);
  });
});

describe("seam accuracy", () => {
  it("is the exact share of ticks on the line", () => {
    expect(seamAccuracy({ progress: 1, ticks: 200, insideTicks: 150, assisted: false })).toBe(0.75);
    expect(seamAccuracy({ progress: 0, ticks: 0, insideTicks: 0, assisted: false })).toBe(0);
  });

  it("caps assisted seams at 80%", () => {
    expect(ASSIST_SEW_ACCURACY_CAP).toBe(0.8);
    expect(seamAccuracy({ progress: 1, ticks: 100, insideTicks: 98, assisted: true })).toBe(0.8);
    expect(seamAccuracy({ progress: 1, ticks: 100, insideTicks: 15, assisted: true })).toBe(0.15);
  });
});

describe("recording a seam", () => {
  it("stores exact counts and resumes them without reweighting", () => {
    const start = atSewingMachine();
    const seamId = firstSeamId(start);
    const half = sew(start, seamId, { progress: 0.5, ticks: 120, insideTicks: 60, assisted: false });
    expect(half.activeRun?.seams[seamId]).toEqual({
      progress: 0.5,
      ticks: 120,
      insideTicks: 60,
      assisted: false,
    });
    const done = sew(half, seamId, { progress: 1, ticks: 240, insideTicks: 180, assisted: false });
    expect(seamResult(done, seamId)).toEqual({ seamId, progress: 1, accuracy: 0.75 });
  });

  it("rejects malformed or backwards samples with the same state", () => {
    const start = atSewingMachine();
    const seamId = firstSeamId(start);
    const half = sew(start, seamId, { progress: 0.5, ticks: 120, insideTicks: 60, assisted: false });
    const rejected: SeamProgress[] = [
      { progress: 0.6, ticks: 119, insideTicks: 60, assisted: false },
      { progress: 0.6, ticks: 120, insideTicks: 60, assisted: false },
      { progress: 0.4, ticks: 130, insideTicks: 60, assisted: false },
      { progress: 0.6, ticks: 130, insideTicks: 59, assisted: false },
      { progress: 0.6, ticks: 130, insideTicks: 71, assisted: false },
      { progress: 0.6, ticks: 130.5, insideTicks: 60, assisted: false },
      { progress: 0.6, ticks: 130, insideTicks: 60.5, assisted: false },
      { progress: 1.2, ticks: 130, insideTicks: 60, assisted: false },
      { progress: Number.NaN, ticks: 130, insideTicks: 60, assisted: false },
    ];
    for (const sample of rejected) expect(sew(half, seamId, sample)).toBe(half);
    expect(sew(start, seamId, { progress: 0.5, ticks: 10, insideTicks: 11, assisted: false })).toBe(start);
    expect(sew(start, seamId, { progress: 0, ticks: 0, insideTicks: 0, assisted: false })).toBe(start);
    expect(sew(start, "hem-of-mystery", { progress: 0.5, ticks: 10, insideTicks: 5, assisted: false })).toBe(
      start,
    );
    const done = sew(half, seamId, { progress: 1, ticks: 240, insideTicks: 200, assisted: false });
    expect(sew(done, seamId, { progress: 1, ticks: 300, insideTicks: 250, assisted: false })).toBe(done);
  });

  it("rejects ticks that sew too fast or too slow for the machine", () => {
    const start = atSewingMachine();
    const seamId = firstSeamId(start);
    expect(MIN_TICKS_PER_SEAM).toBe(60);
    expect(MAX_TICKS_PER_SEAM).toBe(1200);
    const tooFast: SeamProgress[] = [
      { progress: 1, ticks: 1, insideTicks: 1, assisted: false },
      { progress: 1, ticks: 59, insideTicks: 59, assisted: false },
      { progress: 0.5, ticks: 29, insideTicks: 29, assisted: false },
    ];
    const tooSlow: SeamProgress[] = [
      { progress: 0.1, ticks: 122, insideTicks: 122, assisted: false },
      { progress: 0.001, ticks: 3, insideTicks: 3, assisted: false },
      { progress: 1, ticks: 1202, insideTicks: 1202, assisted: false },
    ];
    for (const sample of [...tooFast, ...tooSlow]) expect(sew(start, seamId, sample)).toBe(start);
    const half = sew(start, seamId, { progress: 0.5, ticks: 120, insideTicks: 60, assisted: false });
    expect(sew(half, seamId, { progress: 0.5, ticks: 130, insideTicks: 60, assisted: false })).toBe(half);
    expect(sew(half, seamId, { progress: 0.9, ticks: 121, insideTicks: 61, assisted: false })).toBe(half);
    expect(sew(half, seamId, { progress: 0.51, ticks: 134, insideTicks: 60, assisted: false })).toBe(half);
  });

  it("accepts the fastest and slowest real feeds", () => {
    const start = atSewingMachine();
    const seamId = firstSeamId(start);
    const fastest = sew(start, seamId, { progress: 1, ticks: 146, insideTicks: 140, assisted: false });
    expect(fastest.activeRun?.seams[seamId]?.ticks).toBe(146);
    const slowest = sew(start, seamId, { progress: 1, ticks: 720, insideTicks: 700, assisted: false });
    expect(slowest.activeRun?.seams[seamId]?.ticks).toBe(720);
    const tap = sew(start, seamId, { progress: 1 / 720, ticks: 1, insideTicks: 1, assisted: false });
    const clampedLastTick = sew(tap, seamId, { progress: 1, ticks: 720, insideTicks: 720, assisted: false });
    expect(clampedLastTick.activeRun?.seams[seamId]?.progress).toBe(1);
  });

  it("caps the whole seam once any part of it was assisted", () => {
    const start = atSewingMachine();
    const seamId = firstSeamId(start);
    const assisted = sew(start, seamId, { progress: 0.3, ticks: 60, insideTicks: 60, assisted: true });
    const finished = sew(assisted, seamId, { progress: 1, ticks: 200, insideTicks: 200, assisted: false });
    expect(finished.activeRun?.seams[seamId]?.assisted).toBe(true);
    expect(seamResult(finished, seamId)?.accuracy).toBe(0.8);
  });

  it("starts over from zero after a reset", () => {
    const start = atSewingMachine();
    const seamId = firstSeamId(start);
    const assisted = sew(start, seamId, { progress: 1, ticks: 200, insideTicks: 190, assisted: true });
    const reset = reduce(assisted, { type: "resetSeam", seamId });
    expect(reset.activeRun?.seams[seamId]).toBeUndefined();
    const plain = sew(reset, seamId, { progress: 1, ticks: 100, insideTicks: 90, assisted: false });
    expect(plain.activeRun?.seams[seamId]).toEqual({
      progress: 1,
      ticks: 100,
      insideTicks: 90,
      assisted: false,
    });
  });
});

describe("seam catalog", () => {
  it("only gives seams to parts with pieces, so every seam has a fabric to sew", () => {
    for (const part of GARMENT_PARTS)
      if (part.seams.length > 0) expect(part.pieces.length).toBeGreaterThan(0);
  });
});
