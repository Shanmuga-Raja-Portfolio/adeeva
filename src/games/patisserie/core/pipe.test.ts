import { describe, expect, it } from "vitest";
import type { Point } from "../../../engine/geometry/point";
import { PIPE_PATTERNS } from "../content/pipePattern";
import type { GameState } from "./gameState";
import { areSamplesValid, checkpoints, coverage, pathLength, pipeAccuracy, pipeTolerance } from "./pipe";
import { reduce } from "./reduce";
import {
  GOOD_PLAN,
  lastGigId,
  newTestGame,
  playRunTo,
  settleStories,
  traceSamples,
  withOrder,
} from "./testPlaythrough";

const swirl = PIPE_PATTERNS["cupcake-tray"].a.paths[0];
const ring = PIPE_PATTERNS["layer-cake"].a.paths[0];

function atPipe(): GameState {
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
    "pipe",
  );
}

describe("piping", () => {
  it("places a checkpoint every centimetre, closing rings but not swirls", () => {
    if (swirl === undefined || ring === undefined) throw new Error("missing paths");
    expect(checkpoints(swirl).length).toBe(Math.floor(pathLength(swirl)) + 1);
    expect(pathLength(ring)).toBeGreaterThan(2 * Math.PI * 8.6);
    const openRing = { ...ring, closed: false };
    expect(pathLength(openRing)).toBeLessThan(pathLength(ring));
  });

  it("scores a careful trace highly and a short perfect squiggle low", () => {
    if (swirl === undefined || ring === undefined) throw new Error("missing paths");
    expect(pipeAccuracy(traceSamples(swirl, 0), swirl, 0.8, false)).toBeCloseTo(1);
    expect(pipeAccuracy(traceSamples(ring, 0), ring, 0.8, false)).toBeCloseTo(1);
    const squiggle = traceSamples(ring, 0).slice(0, 6);
    expect(coverage(squiggle, ring, 0.8)).toBeLessThan(0.1);
    expect(pipeAccuracy(squiggle, ring, 0.8, false)).toBeLessThan(0.1);
    expect(pipeAccuracy(traceSamples(ring, 1.6), ring, 0.8, false)).toBeLessThan(0.4);
    expect(pipeAccuracy(traceSamples(ring, 0), ring, 0.8, true)).toBe(0.8);
  });

  it("does not join an open swirl's ends when checking the line", () => {
    if (swirl === undefined) throw new Error("missing path");
    const start = swirl.points[0];
    const end = swirl.points[swirl.points.length - 1];
    if (start === undefined || end === undefined) throw new Error("empty path");
    const across: Point[] = Array.from({ length: 10 }, (_, index) => [
      start[0] + ((end[0] - start[0]) * (index + 0.5)) / 10,
      start[1] + ((end[1] - start[1]) * (index + 0.5)) / 10,
    ]);
    expect(pipeAccuracy(across, { ...swirl, closed: true }, 0.4, false)).toBeGreaterThan(
      pipeAccuracy(across, swirl, 0.4, false),
    );
  });

  it("is more forgiving with the Pro Piping Set, a perfectionist or on Relaxed", () => {
    expect(pipeTolerance(newTestGame())).toBeCloseTo(0.8);
    expect(pipeTolerance({ ...newTestGame(), upgrades: ["piping-set"] })).toBeCloseTo(0.92);
    expect(pipeTolerance(newTestGame({ trait: "perfectionist" }))).toBeCloseTo(0.96);
    expect(pipeTolerance(newTestGame({ difficulty: "relaxed" }))).toBeCloseTo(1.04);
  });

  it("validates samples and records each path once", () => {
    expect(areSamplesValid([[1, 1]])).toBe(false);
    expect(
      areSamplesValid([
        [1, 1],
        [1.1, 1],
      ]),
    ).toBe(false);
    expect(
      areSamplesValid([
        [1, 1],
        [25, 1],
      ]),
    ).toBe(false);
    expect(areSamplesValid(Array.from({ length: 2001 }, (_, index): Point => [(index % 80) * 0.25, 1]))).toBe(
      false,
    );
    const state = atPipe();
    if (swirl === undefined) throw new Error("missing path");
    const piped = reduce(state, {
      type: "pipePath",
      pathId: swirl.id,
      samples: traceSamples(swirl, 0),
      assisted: false,
    });
    expect(piped.activeRun?.pipes[swirl.id]?.accuracy).toBeCloseTo(1);
    expect(
      reduce(piped, { type: "pipePath", pathId: swirl.id, samples: traceSamples(swirl, 0), assisted: false }),
    ).toBe(piped);
    expect(
      reduce(state, {
        type: "pipePath",
        pathId: "nowhere",
        samples: traceSamples(swirl, 0),
        assisted: false,
      }),
    ).toBe(state);
  });

  it("traces every path of every pattern with samples the bench accepts", () => {
    for (const patterns of Object.values(PIPE_PATTERNS))
      for (const pattern of Object.values(patterns))
        for (const path of pattern.paths) {
          const samples = traceSamples(path, 0);
          expect(areSamplesValid(samples), path.id).toBe(true);
          expect(pipeAccuracy(samples, path, 0.8, false), path.id).toBeGreaterThan(0.95);
        }
  });
});
