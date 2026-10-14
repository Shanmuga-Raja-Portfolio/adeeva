import { describe, expect, it } from "vitest";
import { isPathTraced } from "../../../engine/geometry/pathTrace";
import { ASSIST_CUT_ACCURACY, distanceToOutline } from "../../../engine/geometry/traceAccuracy";
import { findPart } from "./pieceParts";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import { cutKey, fitSawSamples, partCuts } from "./sawRecord";
import { canGoBack } from "./stageNavigation";
import {
  BIRDHOUSE_PLAN,
  lastGigId,
  newTestGame,
  playUntil,
  runOf,
  sawActions,
  dispatchAll,
  settleStories,
  tracePoints,
  withActiveGig,
  type PiecePlan,
} from "./testPlaythrough";
import type { GameState } from "./gameState";

function atSaw(clientId: string, plan: PiecePlan): GameState {
  const state = withActiveGig(settleStories(newTestGame({ trait: "perfectionist" })), clientId);
  return playUntil(state, lastGigId(state), plan, "saw");
}

function roofCut(state: GameState) {
  const run = runOf(state);
  const roof = findPart(run.design, "roof-1");
  if (roof === undefined) throw new Error("No roof");
  return partCuts(state, run, roof);
}

describe("sawing", () => {
  it("leaves board edges out of the pencil line, so the saw line is open", () => {
    const state = atSaw("grandpa-teodor", BIRDHOUSE_PLAN);
    const [cut] = roofCut(state);
    expect(cut?.closed).toBe(false);
    expect(cut?.points[0]).toEqual([18, 0]);
    expect(cut?.points[cut.points.length - 1]).toEqual([0, 14]);
    const onBoardEdge: [number, number] = [0, 7];
    expect(distanceToOutline(onBoardEdge, cut?.points ?? [], false)).toBe(7);
    const wholeRectangle: [number, number][] = [
      [0, 0],
      [18, 0],
      [18, 14],
      [0, 14],
    ];
    expect(distanceToOutline(onBoardEdge, wholeRectangle, true)).toBe(0);
  });

  it("records an accurate cut and refuses one that stops early or is too sparse", () => {
    const state = atSaw("grandpa-teodor", BIRDHOUSE_PLAN);
    const [cut] = roofCut(state);
    if (cut === undefined) throw new Error("No cut");
    const full = tracePoints(cut);
    const half = full.slice(0, Math.floor(full.length / 2));
    const sparse = full.filter((_, index) => index % 20 === 0);
    expect(reduce(state, { type: "sawCut", partId: "roof-1", cut: 0, samples: half })).toBe(state);
    expect(reduce(state, { type: "sawCut", partId: "roof-1", cut: 0, samples: sparse })).toBe(state);
    expect(isPathTraced(cut, sparse, 1)).toBe(false);
    const sawn = reduce(state, { type: "sawCut", partId: "roof-1", cut: 0, samples: full });
    expect(runOf(sawn).cuts[cutKey("roof-1", 0)]).toEqual({ accuracy: 1, assisted: false });
    expect(reduce(sawn, { type: "sawCut", partId: "roof-1", cut: 0, samples: full })).toBe(sawn);
  });

  it("fits a very long, slow line into the sample limit so the finished cut still counts", () => {
    const state = atSaw("grandpa-teodor", BIRDHOUSE_PLAN);
    const [cut] = roofCut(state);
    if (cut === undefined) throw new Error("No cut");
    const start = cut.points[0];
    if (start === undefined) throw new Error("No start");
    const dawdle = Array.from({ length: 20_100 }, (): [number, number] => [start[0], start[1]]);
    const slow = [...dawdle, ...tracePoints(cut)];
    expect(reduce(state, { type: "sawCut", partId: "roof-1", cut: 0, samples: slow })).toBe(state);
    const fitted = fitSawSamples(slow);
    expect(fitted.length).toBeLessThanOrEqual(20_000);
    expect(fitted[fitted.length - 1]).toEqual(slow[slow.length - 1]);
    expect(fitSawSamples(tracePoints(cut))).toEqual(tracePoints(cut));
    const sawn = reduce(state, { type: "sawCut", partId: "roof-1", cut: 0, samples: fitted });
    expect(runOf(sawn).cuts[cutKey("roof-1", 0)]?.accuracy).toBe(1);
  });

  it("scores a wobbly cut by the share of samples within the tolerance", () => {
    const state = atSaw("grandpa-teodor", BIRDHOUSE_PLAN);
    const [cut] = roofCut(state);
    if (cut === undefined) throw new Error("No cut");
    const wobbly = tracePoints(cut).map(([x, y], index): [number, number] =>
      index % 2 === 0 ? [x + 2.5, y + 2.5] : [x, y],
    );
    const sawn = reduce(state, { type: "sawCut", partId: "roof-1", cut: 0, samples: wobbly });
    const accuracy = runOf(sawn).cuts[cutKey("roof-1", 0)]?.accuracy ?? 0;
    expect(accuracy).toBeGreaterThan(0.45);
    expect(accuracy).toBeLessThan(0.75);
  });

  it("scores the guide rail at a flat 0.8 and locks the design", () => {
    const state = atSaw("grandpa-teodor", BIRDHOUSE_PLAN);
    expect(canGoBack(state, "layout").ok).toBe(true);
    const assisted = reduce(state, { type: "sawAssist", partId: "roof-1" });
    expect(runOf(assisted).cuts[cutKey("roof-1", 0)]).toEqual({
      accuracy: ASSIST_CUT_ACCURACY,
      assisted: true,
    });
    expect(canGoBack(assisted, "layout").ok).toBe(false);
  });

  it("uses up a board once all its parts are sawn", () => {
    const state = atSaw("grandpa-teodor", BIRDHOUSE_PLAN);
    expect(state.boards).toHaveLength(1);
    const sawn = dispatchAll(state, sawActions(state, "assist"));
    expect(sawn.boards).toHaveLength(0);
    expect(runOf(sawn).usedBoards).toHaveLength(1);
  });

  it("returns a long spare piece as a short board of the same wood", () => {
    const plan: PiecePlan = {
      ...BIRDHOUSE_PLAN,
      productId: "bookshelf",
      options: { edge: "square-edge", accent: "no-accent" },
    };
    const state = atSaw("ms-ingrid", plan);
    const sawn = dispatchAll(state, sawActions(state, "assist"));
    expect(sawn.boards).toHaveLength(1);
    expect(sawn.boards[0]).toMatchObject({ size: "short", woodId: "pine", spare: true, cost: 0 });
  });

  it("keeps a knot that crosses into the spare end", () => {
    const plan: PiecePlan = {
      ...BIRDHOUSE_PLAN,
      productId: "bookshelf",
      options: { edge: "square-edge", accent: "no-accent" },
    };
    const state = atSaw("ms-ingrid", plan);
    const lastShelfBoard = runOf(state).placements["shelf-3"]?.boardId;
    const knotted: GameState = {
      ...state,
      boards: state.boards.map((board) =>
        board.id === lastShelfBoard ? { ...board, knots: [{ x: 59, y: 10, r: 3 }] } : board,
      ),
    };
    const sawn = dispatchAll(knotted, sawActions(knotted, "assist"));
    expect(sawn.boards[0]?.knots).toEqual([{ x: -1, y: 10, r: 3 }]);
    expect(parseSave(serialize(sawn))).toEqual({ ok: true, state: sawn });
  });

  it("adds a closed cut for a star cut-out", () => {
    const state = atSaw("grandpa-teodor", {
      ...BIRDHOUSE_PLAN,
      options: { edge: "rounded-edge", accent: "star-cutout" },
    });
    const run = runOf(state);
    const front = findPart(run.design, "gable-1");
    if (front === undefined) throw new Error("No front");
    const cuts = partCuts(state, run, front);
    expect(cuts).toHaveLength(2);
    expect(cuts[1]?.closed).toBe(true);
    expect(cuts[1]?.points).toHaveLength(10);
  });
});
