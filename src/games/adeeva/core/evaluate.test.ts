import { describe, expect, it } from "vitest";
import { snapshotRun, type DressSnapshot } from "./dressSnapshot";
import { starsForScore } from "../../../engine/score";
import { evaluate } from "./evaluate";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { craftToReview, DEFAULT_CRAFT, newTestGame, withActiveGig } from "./testPlaythrough";

function reviewedGig(options = DEFAULT_CRAFT): GameState {
  const base = withActiveGig(newTestGame(), "mom");
  const gig = base.gigs.active[0];
  if (gig === undefined) throw new Error("expected a gig");
  return craftToReview(reduce(base, { type: "startRun", gigId: gig.id }), options);
}

function snapshotOf(state: GameState): DressSnapshot {
  if (state.activeRun === null) throw new Error("expected a run");
  return snapshotRun(state.activeRun);
}

describe("evaluate", () => {
  it("is deterministic for the same snapshot", () => {
    const state = reviewedGig();
    const run = state.activeRun;
    if (run === null) throw new Error("expected a run");
    const first = evaluate(snapshotRun(run), run.brief, { deliveredDay: 2 });
    const second = evaluate(snapshotRun(run), run.brief, { deliveredDay: 2 });
    expect(second).toEqual(first);
  });

  it("lists every criterion with a reason", () => {
    const state = reviewedGig();
    const run = state.activeRun;
    if (run === null) throw new Error("expected a run");
    const result = evaluate(snapshotOf(state), run.brief, { deliveredDay: 1 });
    expect(result.criteria.map((criterion) => criterion.id)).toEqual([
      "construction",
      "quality",
      "style",
      "colours",
      "trims",
      "budget",
      "deadline",
    ]);
    expect(result.criteria.every((criterion) => criterion.detail.length > 0 && criterion.weight > 0)).toBe(
      true,
    );
    expect(result.passed).toBe(true);
    expect(result.quality.quality).toBe(92);
    expect(result.feedback).toEqual([]);
  });

  it("fails missing trims and late delivery with kind feedback", () => {
    const state = reviewedGig({ ...DEFAULT_CRAFT, addRequiredTrims: false });
    const run = state.activeRun;
    if (run === null) throw new Error("expected a run");
    const result = evaluate(snapshotOf(state), run.brief, { deliveredDay: run.brief.deadlineDay + 1 });
    const failed = result.criteria.filter((criterion) => !criterion.passed).map((criterion) => criterion.id);
    expect(failed).toEqual(["trims", "deadline"]);
    expect(result.passed).toBe(false);
    expect(result.feedback).toHaveLength(2);
    expect(result.feedback[0]).toContain("Covered Button");
  });

  it("lets cut accuracy, seam accuracy and grain change quality", () => {
    const steady = reviewedGig();
    const shaky = reviewedGig({ ...DEFAULT_CRAFT, cutAccuracy: 0.4, seamAccuracy: 0.5 });
    const brief = steady.activeRun?.brief;
    if (brief === undefined) throw new Error("expected a brief");
    const steadyQuality = evaluate(snapshotOf(steady), brief, { deliveredDay: 1 }).quality.quality;
    const shakyQuality = evaluate(snapshotOf(shaky), brief, { deliveredDay: 1 }).quality.quality;
    expect(shakyQuality).toBeLessThan(steadyQuality);
    const crossGrain: DressSnapshot = {
      ...snapshotOf(steady),
      pieces: snapshotOf(steady).pieces.map((piece) => ({ ...piece, grainScore: 0.6 })),
    };
    expect(evaluate(crossGrain, brief, { deliveredDay: 1 }).quality.grain).toBe(0.6);
    expect(evaluate(crossGrain, brief, { deliveredDay: 1 }).quality.quality).toBeLessThan(steadyQuality);
  });

  it("maps scores to stars", () => {
    expect([100, 90, 89, 75, 60, 40, 10].map(starsForScore)).toEqual([5, 5, 4, 4, 3, 2, 1]);
  });
});
