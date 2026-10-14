import { describe, expect, it } from "vitest";
import type { Point } from "../../../engine/geometry/point";
import type { DifficultyId } from "../../../engine/difficulty";
import type { TraitId } from "../../../engine/trait";
import type { MetalId } from "../content/metal";
import type { UpgradeId } from "../content/upgrade";
import { cutToleranceMm, dotReach, runCutPaths, scoringTolerance, trimStroke } from "./cutRecord";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import {
  GOOD_PLAN,
  lastGigId,
  newTestGame,
  playRunTo,
  settleStories,
  traceStrokes,
  TEST_PX_PER_MM,
  withOrder,
} from "./testPlaythrough";

function skill(difficulty: DifficultyId, trait: TraitId = "dreamer", upgrades: UpgradeId[] = []) {
  return { profile: { ...newTestGame().profile, difficulty, trait }, upgrades };
}

function atCut(metalId: MetalId = "brass", options = {}): GameState {
  const ordered = withOrder(settleStories(newTestGame()), "gran-mina");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  return playRunTo(started, { ...GOOD_PLAN, metalId, options }, "cut");
}

function pathOf(state: GameState, id: string) {
  const run = state.activeRun;
  if (run === null) throw new Error("no run");
  const path = runCutPaths(run).find((entry) => entry.id === id);
  if (path === undefined) throw new Error(`no path ${id}`);
  return path;
}

describe("cut tolerance", () => {
  it("is a pure product of base, trait, tool, difficulty and metal hardness", () => {
    expect(cutToleranceMm(skill("relaxed"), "copper")).toBeCloseTo(0.832, 3);
    expect(cutToleranceMm(skill("challenging"), "silver")).toBeCloseTo(0.51, 3);
    expect(cutToleranceMm(skill("standard", "perfectionist"), "brass")).toBeCloseTo(0.8 * 1.2 * 0.7, 6);
    expect(cutToleranceMm(skill("standard", "dreamer", ["steady-peg"]), "brass")).toBeCloseTo(
      0.8 * 1.15 * 0.7,
      6,
    );
    expect(cutToleranceMm(skill("standard"), "bronze")).toBeLessThan(
      cutToleranceMm(skill("standard"), "copper"),
    );
  });

  it("never drops below eight screen pixels", () => {
    expect(scoringTolerance(0.51, 20)).toBeCloseTo(0.51);
    expect(scoringTolerance(0.51, 5)).toBeCloseTo(1.6);
  });
});

describe("corner dots", () => {
  const dots: Point[] = [
    [0, 0],
    [10, 0],
  ];

  it("stop a stroke at the first dot it reaches, keeping samples near that dot", () => {
    const stroke: Point[] = [
      [0, 0],
      [2, 0],
      [5, 0],
      [9.8, 0],
      [10, 0],
      [10, 3],
      [10, 6],
    ];
    expect(trimStroke(stroke, dots, 1)).toEqual(stroke.slice(0, 5));
  });

  it("let a stroke that starts on a dot leave it freely", () => {
    const stroke: Point[] = [
      [0, 0],
      [0.5, 0],
      [3, 0],
    ];
    expect(trimStroke(stroke, dots, 1)).toEqual(stroke);
  });

  it("sizes the reach to the gap between dots", () => {
    const state = atCut("brass", { shape: "star" });
    const star = pathOf(state, "plate");
    expect(dotReach(star)).toBeGreaterThanOrEqual(0.5);
    expect(dotReach(star)).toBeLessThanOrEqual(1.5);
  });
});

describe("cutting a part", () => {
  it("scores a careful trace near 1 and consumes each planned sheet once", () => {
    const state = atCut();
    const before = state.stock.metal.brass.sheet;
    const cut = reduce(state, {
      type: "cutPath",
      pathId: "plate",
      strokes: traceStrokes(pathOf(state, "plate"), 0),
      pxPerMm: TEST_PX_PER_MM,
      assisted: false,
    });
    expect(cut).not.toBe(state);
    expect(cut.activeRun?.cuts.plate?.accuracy).toBeGreaterThan(0.99);
    expect(cut.stock.metal.brass.sheet).toBe(before - 1);
    const again = reduce(cut, {
      type: "cutPath",
      pathId: "seat",
      strokes: traceStrokes(pathOf(cut, "seat"), 0),
      pxPerMm: TEST_PX_PER_MM,
      assisted: false,
    });
    expect(again.stock.metal.brass.sheet).toBe(before - 1);
    expect(
      reduce(again, {
        type: "cutPath",
        pathId: "plate",
        strokes: traceStrokes(pathOf(cut, "plate"), 0),
        pxPerMm: 10,
        assisted: false,
      }),
    ).toBe(again);
  });

  it("scores a wobbly trace lower", () => {
    const state = atCut();
    const cut = reduce(state, {
      type: "cutPath",
      pathId: "plate",
      strokes: traceStrokes(pathOf(state, "plate"), 0.9),
      pxPerMm: TEST_PX_PER_MM,
      assisted: false,
    });
    expect(cut.activeRun?.cuts.plate?.accuracy).toBeLessThan(0.75);
  });

  it("refuses a cut that has not gone all the way round", () => {
    const state = atCut();
    const strokes = traceStrokes(pathOf(state, "plate"), 0);
    const half = [strokes.flat().slice(0, Math.floor(strokes.flat().length / 2))];
    expect(
      reduce(state, { type: "cutPath", pathId: "plate", strokes: half, pxPerMm: 10, assisted: false }),
    ).toBe(state);
  });

  it("ignores everything past a corner dot, so a star needs a turn at each point", () => {
    const state = atCut("brass", { shape: "star" });
    const star = pathOf(state, "plate");
    const oneStroke = [traceStrokes(star, 0).flat()];
    expect(
      reduce(state, { type: "cutPath", pathId: "plate", strokes: oneStroke, pxPerMm: 10, assisted: false }),
    ).toBe(state);
    const turned = reduce(state, {
      type: "cutPath",
      pathId: "plate",
      strokes: traceStrokes(star, 0),
      pxPerMm: 10,
      assisted: false,
    });
    expect(turned.activeRun?.cuts.plate).toBeDefined();
  });

  it("caps the guide rail at a flat 0.8", () => {
    const state = atCut();
    const cut = reduce(state, {
      type: "cutPath",
      pathId: "plate",
      strokes: [traceStrokes(pathOf(state, "plate"), 0).flat()],
      pxPerMm: TEST_PX_PER_MM,
      assisted: true,
    });
    expect(cut.activeRun?.cuts.plate).toEqual({ accuracy: 0.8, assisted: true });
  });

  it("rejects a zoom outside 5 to 20 pixels per millimetre and samples far off the part", () => {
    const state = atCut();
    const strokes = traceStrokes(pathOf(state, "plate"), 0);
    expect(reduce(state, { type: "cutPath", pathId: "plate", strokes, pxPerMm: 4, assisted: false })).toBe(
      state,
    );
    expect(reduce(state, { type: "cutPath", pathId: "plate", strokes, pxPerMm: 21, assisted: false })).toBe(
      state,
    );
    expect(
      reduce(state, {
        type: "cutPath",
        pathId: "plate",
        strokes: [...strokes, [[90, 90]]],
        pxPerMm: 10,
        assisted: false,
      }),
    ).toBe(state);
  });
});
