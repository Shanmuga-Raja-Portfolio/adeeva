import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { ROLLER_LOAD } from "./makeoverRun";
import { crossedCells, paintableCells, rollCoverage, rollRecord, rollScore } from "./paintRoll";
import { reduce } from "./reduce";
import { splatSpeed } from "./skillTolerance";
import {
  lastGigId,
  newTestGame,
  playRunTo,
  recipeFor,
  rowStroke,
  settleStories,
  withOrder,
} from "./testPlaythrough";

function atPaint(): GameState {
  const ordered = withOrder(settleStories(newTestGame()), "nana-pearl");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  return playRunTo(started, recipeFor("nana-pearl"), "paint");
}

function run(state: GameState) {
  if (state.activeRun === null) throw new Error("no run");
  return state.activeRun;
}

describe("rolling", () => {
  it("skips window cells and crosses cells in stroke order", () => {
    const current = run(atPaint());
    expect(paintableCells(current, "back")).toHaveLength(36);
    expect(paintableCells(current, "side")).toHaveLength(40);
    expect(crossedCells(current, "side", rowStroke(0))).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(crossedCells(current, "back", rowStroke(1))).toEqual([8, 9, 10, 13, 14, 15]);
  });

  it("spends paint load, then leaves dry streaks until the roller is dipped", () => {
    let state = atPaint();
    for (let row = 0; row < 2; row += 1)
      state = reduce(state, { type: "rollStroke", wall: "side", points: rowStroke(row), durationMs: 1000 });
    expect(run(state).roller).toBe(0);
    expect(rollRecord(run(state), "side").passes.filter((pass) => pass > 0)).toHaveLength(ROLLER_LOAD);
    state = reduce(state, { type: "rollStroke", wall: "side", points: rowStroke(2), durationMs: 1000 });
    expect(rollRecord(run(state), "side").dryStrokes).toBe(1);
    state = reduce(state, { type: "reloadRoller" });
    expect(run(state).roller).toBe(ROLLER_LOAD);
    expect(reduce(state, { type: "reloadRoller" })).toBe(state);
  });

  it("flicks a splat only when the stroke is faster than the splat speed", () => {
    const state = atPaint();
    const points = rowStroke(0);
    const length = 492;
    const limit = splatSpeed(state);
    const atEdge = Math.ceil((length * 1000) / limit) + 1;
    const calm = reduce(state, { type: "rollStroke", wall: "side", points, durationMs: atEdge });
    expect(rollRecord(run(calm), "side").splats).toHaveLength(0);
    const quick = reduce(state, { type: "rollStroke", wall: "side", points, durationMs: atEdge - 40 });
    expect(rollRecord(run(quick), "side").splats).toHaveLength(1);
  });

  it("ignores tiny or impossible strokes", () => {
    const state = atPaint();
    const short = reduce(state, {
      type: "rollStroke",
      wall: "side",
      points: [
        [10, 10],
        [20, 10],
      ],
      durationMs: 400,
    });
    expect(short).toBe(state);
    expect(reduce(state, { type: "rollStroke", wall: "side", points: rowStroke(0), durationMs: 10 })).toBe(
      state,
    );
  });

  it("scores two full coats as complete and takes off for splats and dry strokes", () => {
    let state = atPaint();
    for (let coat = 0; coat < 2; coat += 1)
      for (let row = 0; row < 5; row += 1) {
        state = reduce(state, { type: "reloadRoller" });
        state = reduce(state, { type: "rollStroke", wall: "side", points: rowStroke(row), durationMs: 1000 });
      }
    expect(rollCoverage(run(state), "side")).toBe(1);
    expect(rollScore(state, run(state), "side")).toBe(1);
    let dry = state;
    for (let stroke = 0; stroke < 2; stroke += 1)
      dry = reduce(dry, { type: "rollStroke", wall: "side", points: rowStroke(stroke), durationMs: 1000 });
    expect(rollRecord(run(dry), "side").dryStrokes).toBe(1);
    expect(rollScore(dry, run(dry), "side")).toBeCloseTo(0.9);
  });

  it("caps an assisted wall", () => {
    const state = reduce(atPaint(), { type: "assistPaint", wall: "side" });
    expect(rollScore(state, run(state), "side")).toBe(0.8);
    const challenging = { ...state, profile: { ...state.profile, difficulty: "challenging" as const } };
    expect(rollScore(challenging, run(state), "side")).toBe(0.7);
  });
});
