import { describe, expect, it } from "vitest";
import type { Point } from "../../../engine/geometry/point";
import { productById } from "./catalog";
import type { GameState } from "./gameState";
import { isPolished, MAX_POLISH_STROKES, partMask, partPolishScore, polishScore, shineShare } from "./polish";
import { reduce } from "./reduce";
import { canAdvance } from "./stageReadiness";
import {
  GOOD_PLAN,
  lastGigId,
  newTestGame,
  playRunTo,
  polishRows,
  settleStories,
  withOrder,
} from "./testPlaythrough";

function atPolish(): GameState {
  const ordered = withOrder(settleStories(newTestGame()), "dev");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  return playRunTo(started, { ...GOOD_PLAN, stoneId: null }, "polish");
}

function bandMask(state: GameState): boolean[] {
  const run = state.activeRun;
  const part = productById("stack-ring").parts[0];
  if (run === null || part === undefined) throw new Error("no band");
  return partMask(run, part);
}

function rub(state: GameState, times: number): GameState {
  let next = state;
  for (let pass = 0; pass < times; pass += 1)
    for (const samples of polishRows(56, 3))
      next = reduce(next, { type: "polishStroke", partKey: "band", samples, pxPerMm: 10 });
  return next;
}

describe("polishing", () => {
  it("ignores strokes shorter than 20 screen pixels", () => {
    const state = atPolish();
    const short: Point[] = [
      [1, 1],
      [2.5, 1],
    ];
    expect(reduce(state, { type: "polishStroke", partKey: "band", samples: short, pxPerMm: 10 })).toBe(state);
    expect(reduce(state, { type: "polishStroke", partKey: "band", samples: short, pxPerMm: 20 })).not.toBe(
      state,
    );
  });

  it("adds one pass per stroke to each live cell crossed, capped at 3", () => {
    const state = rub(atPolish(), 5);
    const record = state.activeRun?.polish.band;
    expect(record?.passes.every((passes) => passes === 3)).toBe(true);
    expect(record?.strokes).toBe(30);
  });

  it("counts a part as polished once 60% of its live cells shine", () => {
    const mask = bandMask(atPolish());
    const live = mask.filter(Boolean).length;
    const shineCells = (count: number) => ({
      passes: mask.map((alive, cell) => (alive && cell < count ? 2 : 0)),
      strokes: 4,
      assisted: false,
    });
    expect(isPolished(shineCells(Math.ceil(live * 0.6)), mask)).toBe(true);
    expect(isPolished(shineCells(Math.ceil(live * 0.6) - 1), mask)).toBe(false);
    expect(shineShare(shineCells(live), mask)).toBe(1);
    expect(partPolishScore({ passes: mask.map(() => 1), strokes: 1, assisted: false }, mask)).toBe(0.5);
  });

  it("keeps the piece at polishing until every part shines", () => {
    const once = rub(atPolish(), 1);
    expect(once.activeRun?.polish.band).toBeDefined();
    expect(canAdvance(once).reasons).toContain("Polish 1 more piece.");
    expect(reduce(once, { type: "goToStage", stage: "display" })).toBe(once);
    const shining = rub(once, 1);
    expect(reduce(shining, { type: "goToStage", stage: "display" }).activeRun?.stage).toBe("display");
  });

  it("lets the buffing wheel shine everything for at most 0.8", () => {
    const buffed = reduce(atPolish(), { type: "buffPart", partKey: "band" });
    const run = buffed.activeRun;
    expect(run === null ? 0 : polishScore(run)).toBe(0.8);
    expect(reduce(buffed, { type: "buffPart", partKey: "band" })).toBe(buffed);
  });

  it("restarts only an unpolished part and stops counting after 400 strokes", () => {
    const once = rub(atPolish(), 1);
    expect(reduce(once, { type: "restartPolish", partKey: "band" }).activeRun?.polish.band).toBeUndefined();
    const twice = rub(atPolish(), 2);
    expect(reduce(twice, { type: "restartPolish", partKey: "band" })).toBe(twice);
    const run = twice.activeRun;
    if (run === null) throw new Error("no run");
    const capped: GameState = {
      ...twice,
      activeRun: {
        ...run,
        polish: {
          band: { passes: run.polish.band?.passes ?? [], strokes: MAX_POLISH_STROKES, assisted: false },
        },
      },
    };
    expect(rub(capped, 1)).toBe(capped);
  });
});
