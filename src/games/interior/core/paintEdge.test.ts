import { isPathTraced } from "../../../engine/geometry/pathTrace";
import { describe, expect, it } from "vitest";
import type { NewGameSettings } from "./newGame";
import { edgeAccuracy, runEdgePaths } from "./paintEdge";
import { reduce } from "./reduce";
import { edgeTolerance } from "./skillTolerance";
import {
  edgeSamples,
  lastGigId,
  newTestGame,
  playRunTo,
  recipeFor,
  settleStories,
  withOrder,
} from "./testPlaythrough";

function atPaint(settings: Partial<NewGameSettings> = {}) {
  const ordered = withOrder(settleStories(newTestGame(settings)), "nana-pearl");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  return playRunTo(started, recipeFor("nana-pearl"), "paint");
}

describe("edging", () => {
  it("gives each wall a ceiling tape plus a window frame or a skirting tape", () => {
    const run = atPaint().activeRun;
    if (run === null) throw new Error("no run");
    expect(runEdgePaths(run).map((path) => path.id)).toEqual([
      "back-ceiling",
      "back-frame",
      "side-ceiling",
      "side-skirting",
    ]);
  });

  it("multiplies tolerance by trait, brush and difficulty", () => {
    const standard = newTestGame();
    expect(edgeTolerance(standard)).toBeCloseTo(1.2);
    expect(edgeTolerance(newTestGame({ difficulty: "relaxed" }))).toBeCloseTo(1.56);
    expect(edgeTolerance(newTestGame({ difficulty: "challenging" }))).toBeCloseTo(1.02);
    expect(edgeTolerance(newTestGame({ trait: "perfectionist" }))).toBeCloseTo(1.44);
    expect(edgeTolerance({ ...standard, upgrades: ["long-reach-brush"] })).toBeCloseTo(1.38);
  });

  it("only counts a path brushed to the end, and scores how close the brush stayed on a smooth curve", () => {
    const state = atPaint();
    const run = state.activeRun;
    const path = run === null ? undefined : runEdgePaths(run)[0];
    if (path === undefined) throw new Error("no path");
    const full = edgeSamples(path, 0);
    expect(isPathTraced(path, full, 1.2)).toBe(true);
    expect(isPathTraced(path, full.slice(0, Math.floor(full.length * 0.6)), 1.2)).toBe(false);
    expect(edgeAccuracy(path, full, 1.2)).toBe(1);
    expect(edgeAccuracy(path, edgeSamples(path, 2), 1.2)).toBe(0);
    expect(edgeAccuracy(path, edgeSamples(path, 0.6), 1.2)).toBeCloseTo(0.875);
    expect(edgeAccuracy(path, edgeSamples(path, 1.2), 1.2)).toBeCloseTo(0.5);
    expect(edgeAccuracy(path, edgeSamples(path, 1), 1.2)).toBeLessThan(
      edgeAccuracy(path, edgeSamples(path, 0.5), 1.2),
    );
    const half = reduce(state, { type: "edgePath", pathId: path.id, samples: full.slice(0, 20) });
    expect(half).toBe(state);
    const done = reduce(state, { type: "edgePath", pathId: path.id, samples: full });
    expect(done.activeRun?.edges[path.id]?.accuracy).toBe(1);
    expect(done.activeRun?.locked).toBe(true);
    expect(reduce(done, { type: "edgePath", pathId: path.id, samples: full })).toBe(done);
  });
});
