import { describe, expect, it } from "vitest";
import { ASSIST_CUT_ACCURACY } from "../../../engine/geometry/traceAccuracy";
import { canCommitCut } from "./cutCommit";
import { flipPieces } from "./flipPieces";
import type { GameState } from "./gameState";
import { piecePolygon } from "./placement";
import { reduce } from "./reduce";
import {
  cutActions,
  dispatchAll,
  flipAtUnpick,
  layoutActions,
  newTestGame,
  outlineTrace,
  runOf,
  scrubAll,
  settleStories,
  traceActions,
  unpickAll,
} from "./testPlaythrough";
import { cutTolerance } from "./tolerance";

function atCut(base: GameState = settleStories(newTestGame())): GameState {
  const unpicking = flipAtUnpick(base, "nana-bea", { recipeId: "cushion-cover", parts: {} }, [
    { findId: "faded-jeans", grade: "like-new" },
  ]);
  const cleaning = reduce(unpickAll(unpicking, 2), { type: "goToStage", stage: "clean" });
  const laying = reduce(scrubAll(cleaning, 0), { type: "goToStage", stage: "layout" });
  return dispatchAll(laying, [...layoutActions(laying), { type: "goToStage", stage: "cut" }]);
}

describe("cutting the pieces", () => {
  it("scores each traced outline in the core with the cutting tolerance", () => {
    const state = atCut();
    const exact = dispatchAll(state, cutActions(state, "trace"));
    expect(runOf(exact).cutDone).toBe(true);
    expect(Object.values(runOf(exact).cutAccuracy).every((value) => value === 1)).toBe(true);
    const wobbly = dispatchAll(state, [
      ...Object.keys(runOf(state).placements).map((pieceId) => ({
        type: "traceCut" as const,
        pieceId,
        samples: outlineTrace(state, pieceId).map(([x, y]): [number, number] => [x + 3, y]),
      })),
      { type: "commitCut", assisted: false },
    ]);
    const values = Object.values(runOf(wobbly).cutAccuracy);
    expect(values).toHaveLength(3);
    expect(values.every((value) => value < 1)).toBe(true);
  });

  it("refuses a trace that does not go all the way round the outline", () => {
    const state = atCut();
    const run = runOf(state);
    for (const piece of flipPieces(run.design)) {
      const placement = run.placements[piece.id];
      if (placement === undefined) throw new Error("Piece not placed");
      const corner = piecePolygon(piece, placement)[0];
      if (corner === undefined) throw new Error("Empty outline");
      const piled = Array.from({ length: 8 }, () => corner);
      expect(reduce(state, { type: "traceCut", pieceId: piece.id, samples: piled })).toBe(state);
      const half = outlineTrace(state, piece.id).slice(0, outlineTrace(state, piece.id).length / 2);
      expect(reduce(state, { type: "traceCut", pieceId: piece.id, samples: half })).toBe(state);
    }
    expect(reduce(state, { type: "commitCut", assisted: false })).toBe(state);
  });

  it("keeps kept traces on the run across a trip back to the layout", () => {
    const state = atCut();
    const [first] = traceActions(state);
    if (first === undefined) throw new Error("No pieces");
    const traced = reduce(state, first);
    expect(Object.keys(runOf(traced).cutTraces)).toHaveLength(1);
    const back = reduce(traced, { type: "goToStage", stage: "layout" });
    const again = reduce(back, { type: "goToStage", stage: "cut" });
    expect(runOf(again).cutTraces).toEqual(runOf(traced).cutTraces);
    expect(again.calendar.hoursLeft).toBe(traced.calendar.hoursLeft);
    const pieceId = Object.keys(runOf(traced).cutTraces)[0] ?? "";
    const moved = reduce(back, { type: "removePiece", pieceId });
    expect(runOf(moved).cutTraces).toEqual({});
  });

  it("gives a flat 0.8 for assisted cuts and widens with the cutting mat", () => {
    const state = atCut();
    const assisted = dispatchAll(state, cutActions(state, "assist"));
    expect(Object.values(runOf(assisted).cutAccuracy)).toEqual([0.8, 0.8, 0.8]);
    expect(ASSIST_CUT_ACCURACY).toBe(0.8);
    expect(cutTolerance(state)).toBeCloseTo(1.2, 5);
    expect(cutTolerance({ ...state, upgrades: ["cutting-mat"] })).toBeCloseTo(1.38, 5);
  });

  it("is idempotent, consumes the find and credits saved buttons and scraps", () => {
    const state = atCut();
    const cut = dispatchAll(state, cutActions(state, "assist"));
    expect(dispatchAll(cut, cutActions(state, "assist"))).toBe(cut);
    expect(canCommitCut(cut).ok).toBe(false);
    expect(cut.stock.finds).toHaveLength(0);
    expect(cut.stock.savedTrims.button).toBe(1);
    expect(cut.stock.scraps.length).toBeGreaterThan(state.stock.scraps.length);
    expect(reduce(cut, { type: "goToStage", stage: "layout" })).toBe(cut);
  });

  it("refuses short or missing traces", () => {
    const state = atCut();
    expect(reduce(state, { type: "commitCut", assisted: false })).toBe(state);
    for (const pieceId of Object.keys(runOf(state).placements))
      expect(reduce(state, { type: "traceCut", pieceId, samples: [[0, 0]] })).toBe(state);
  });
});
