import { describe, expect, it } from "vitest";
import type { Point } from "../../../engine/geometry/point";
import { designSurfaces } from "./pieceParts";
import { reduce } from "./reduce";
import {
  applyStrokes,
  ASSIST_SAND_CAP,
  EMPTY_SAND,
  isSurfaceDone,
  isSurfaceWornOut,
  MAX_STROKES,
  sandRecordOf,
  sandStrokes,
  settleDrag,
  splitStrokes,
  surfaceScore,
  surfaceSmooth,
} from "./sanding";
import { sandAngleLimit } from "./tolerance";
import {
  BIRDHOUSE_PLAN,
  lastGigId,
  newTestGame,
  playUntil,
  runOf,
  sandPath,
  settleStories,
  withActiveGig,
} from "./testPlaythrough";

describe("sanding strokes", () => {
  it("splits a back-and-forth rub into strokes at each reversal", () => {
    const rub: Point[] = [
      [10, 20],
      [200, 20],
      [40, 22],
      [250, 20],
    ];
    expect(splitStrokes(rub)).toHaveLength(3);
  });

  it("ignores tiny wiggles under 30 units", () => {
    expect(
      splitStrokes([
        [10, 10],
        [30, 10],
      ]),
    ).toHaveLength(0);
  });

  it("counts strokes along the wood lines and across them", () => {
    const along = sandStrokes(
      [
        [10, 20],
        [300, 30],
      ],
      25,
      false,
    );
    const across = sandStrokes(
      [
        [40, 10],
        [40, 150],
      ],
      25,
      false,
    );
    expect(along[0]?.along).toBe(true);
    expect(across[0]?.along).toBe(false);
    expect(
      sandStrokes(
        [
          [40, 10],
          [40, 150],
        ],
        25,
        true,
      )[0]?.along,
    ).toBe(true);
  });

  it("widens the along-the-lines angle for perfectionists and relaxed play", () => {
    expect(sandAngleLimit(newTestGame())).toBe(25);
    expect(sandAngleLimit(newTestGame({ trait: "perfectionist" }))).toBeCloseTo(30);
    expect(sandAngleLimit(newTestGame({ difficulty: "relaxed" }))).toBeCloseTo(32.5);
  });

  it("scores smoothness and halves the scratch share", () => {
    const along = applyStrokes(EMPTY_SAND, sandStrokes(sandPath("along"), 25, false), false);
    expect(surfaceSmooth(along)).toBe(1);
    expect(surfaceScore(along)).toBe(1);
    expect(isSurfaceDone(along)).toBe(true);
    const across = applyStrokes(EMPTY_SAND, sandStrokes(sandPath("across"), 25, false), false);
    const share = across.across / across.strokes;
    expect(share).toBeGreaterThan(0.5);
    expect(surfaceScore(across)).toBeCloseTo(surfaceSmooth(across) * (1 - 0.5 * share));
  });

  it("caps an assisted surface at 0.7", () => {
    const assisted = applyStrokes(EMPTY_SAND, sandStrokes(sandPath("along"), 25, true), true);
    expect(surfaceScore(assisted)).toBe(ASSIST_SAND_CAP);
  });

  it("caps passes at 3 per cell", () => {
    const strokes = sandStrokes(sandPath("along"), 25, false);
    const twice = applyStrokes(applyStrokes(EMPTY_SAND, strokes, false), strokes, false);
    expect(Math.max(...twice.passes)).toBe(3);
    expect(MAX_STROKES).toBe(400);
  });
});

describe("long rubs", () => {
  it("hands over finished strokes while the rub goes on, scoring the same as one drag", () => {
    const rub = sandPath("along");
    const whole = applyStrokes(EMPTY_SAND, sandStrokes(rub, 25, false), false);
    const { settled, rest } = settleDrag(rub);
    expect(settled.length).toBeGreaterThan(1);
    expect(settled[settled.length - 1]).toEqual(rest[0]);
    const first = applyStrokes(EMPTY_SAND, sandStrokes(settled, 25, false), false);
    const both = applyStrokes(first, sandStrokes(rest, 25, false), false);
    expect(both).toEqual(whole);
    const oneWay: Point[] = [
      [10, 20],
      [300, 20],
    ];
    expect(settleDrag(oneWay)).toEqual({ settled: [], rest: oneWay });
  });

  it("keeps strokes up to the limit, then asks for a fresh start", () => {
    const start = withActiveGig(settleStories(newTestGame()), "grandpa-teodor");
    const sanding = playUntil(start, lastGigId(start), BIRDHOUSE_PLAN, "sand");
    const surface = designSurfaces(runOf(sanding))[0];
    if (surface === undefined) throw new Error("No surface");
    const run = runOf(sanding);
    const tired = {
      ...sanding,
      activeRun: { ...run, sanding: { [surface.id]: { ...EMPTY_SAND, strokes: MAX_STROKES - 1 } } },
    };
    const rub: Point[] = [
      [10, 20],
      [300, 20],
      [10, 60],
      [300, 60],
    ];
    const rubbed = reduce(tired, { type: "sandDrag", surfaceId: surface.id, points: rub, assisted: false });
    const record = sandRecordOf(runOf(rubbed), surface.id);
    expect(record.strokes).toBe(MAX_STROKES);
    expect(record.passes.some((passes) => passes > 0)).toBe(true);
    expect(isSurfaceWornOut(record)).toBe(true);
    expect(reduce(rubbed, { type: "sandDrag", surfaceId: surface.id, points: rub, assisted: false })).toBe(
      rubbed,
    );
    const fresh = reduce(rubbed, { type: "resetSurface", surfaceId: surface.id });
    expect(isSurfaceWornOut(sandRecordOf(runOf(fresh), surface.id))).toBe(false);
  });
});
