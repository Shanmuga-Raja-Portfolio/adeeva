import { describe, expect, it } from "vitest";
import { starsForScore } from "../../../engine/score";
import { evaluateFlip } from "./flipEvaluate";
import { QUALITY_WEIGHTS } from "./flipQuality";
import type { GameState } from "./gameState";
import { leavesOf } from "./sustainability";
import {
  newTestGame,
  playFlipToReview,
  runOf,
  settleStories,
  withActiveGig,
  type FlipPlan,
} from "./testPlaythrough";

const PLAN: FlipPlan = {
  design: { recipeId: "cushion-cover", parts: {} },
  findId: "linen-curtain",
  grade: "like-new",
  pullCm: 2,
  harshShare: 0,
  cut: "trace",
  seamAccuracy: 0.9,
};

function review(plan: FlipPlan = PLAN, client = "nana-bea"): GameState {
  const state = withActiveGig(settleStories(newTestGame()), client);
  return playFlipToReview(state, state.gigs.active[0]?.id ?? "", plan);
}

describe("judging a flip", () => {
  it("weights quality terms to 100% and lists all eight criteria", () => {
    expect(Object.values(QUALITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0)).toBeCloseTo(1, 10);
    const state = review();
    const evaluation = evaluateFlip(state, runOf(state), state.calendar.day);
    expect(evaluation.criteria.map((criterion) => criterion.id)).toEqual([
      "construction",
      "quality",
      "style",
      "colours",
      "finishes",
      "budget",
      "deadline",
      "sustainability",
    ]);
    expect(evaluation.passed).toBe(true);
    expect(evaluation.stars).toBe(starsForScore(evaluation.score));
  });

  it("builds the score from the pass mix, the quality and favourite colours", () => {
    const state = review();
    const evaluation = evaluateFlip(state, runOf(state), state.calendar.day);
    const passWeight = evaluation.criteria.filter((c) => c.passed).reduce((sum, c) => sum + c.weight, 0);
    const total = evaluation.criteria.reduce((sum, c) => sum + c.weight, 0);
    const bonus = Math.min(4, 2 * evaluation.favouredColoursUsed);
    expect(evaluation.score).toBe(
      Math.min(
        100,
        Math.round(0.3 * ((100 * passWeight) / total) + 0.7 * evaluation.quality.quality + bonus),
      ),
    );
  });

  it("fails the style gate when the main find is an avoided material", () => {
    const plan: FlipPlan = {
      ...PLAN,
      design: { recipeId: "remade-skirt", parts: { skirt: "mini-skirt" } },
      findId: "faded-jeans",
    };
    const state = review(plan, "ms-okafor");
    const evaluation = evaluateFlip(state, runOf(state), state.calendar.day);
    const style = evaluation.criteria.find((criterion) => criterion.id === "style");
    expect(style?.passed).toBe(false);
    expect(evaluation.passed).toBe(false);
    expect(evaluation.feedback.join(" ")).toContain("denim");
  });

  it("explains missed finishes and leaves kindly", () => {
    const state = review();
    const run = runOf(state);
    const bare = { ...run, finishes: [] };
    const evaluation = evaluateFlip(state, bare, state.calendar.day);
    expect(evaluation.criteria.find((criterion) => criterion.id === "finishes")?.passed).toBe(false);
    expect(evaluation.feedback).toContain("So close! The brief asked for a few more finishing touches.");
    expect(evaluation.passed).toBe(false);
    const strict = { ...run, brief: run.brief === null ? null : { ...run.brief, minLeaves: 100 } };
    const green = evaluateFlip(state, strict, state.calendar.day);
    expect(green.criteria.find((criterion) => criterion.id === "sustainability")?.passed).toBe(false);
    expect(green.feedback).toContain("Lovely piece! Next time, try using more of the old fabric.");
  });

  it("counts reuse, salvage and secondhand finishes as leaves", () => {
    const state = review();
    const run = runOf(state);
    const leaves = leavesOf(run, false);
    expect(leaves.salvage).toBe(1);
    expect(leaves.secondhand).toBe(0);
    const panel = 120 * 160;
    const placed = 45 * 45 + 2 * 45 * 30;
    expect(leaves.reuse).toBeCloseTo(Math.round((placed / (0.5 * panel)) * 1000) / 1000, 5);
    expect(leaves.leaves).toBe(
      Math.round(100 * (0.45 * leaves.reuse + 0.25 * leaves.salvage + 0.3 * leaves.secondhand)),
    );
  });

  it("judges own pieces by quality and leaves only", () => {
    const state = review();
    const own = { ...runOf(state), purpose: { kind: "own" as const }, brief: null };
    const evaluation = evaluateFlip(state, own, state.calendar.day);
    expect(evaluation.kind).toBe("own");
    expect(evaluation.criteria).toEqual([]);
    expect(evaluation.score).toBe(evaluation.quality.quality);
  });
});
