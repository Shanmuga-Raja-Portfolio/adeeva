import { describe, expect, it } from "vitest";
import { cushionSeamAccuracy } from "./cushion";
import { pieceColours } from "./pieceColours";
import { pieceQuality } from "./pieceQuality";
import { pieceTags } from "./pieceTags";
import { reduce } from "./reduce";
import {
  BIRDHOUSE_PLAN,
  lastGigId,
  newTestGame,
  playToReview,
  playUntil,
  runOf,
  settleStories,
  withActiveGig,
  type PiecePlan,
} from "./testPlaythrough";

const BENCH_PLAN: PiecePlan = {
  ...BIRDHOUSE_PLAN,
  productId: "window-bench",
  options: { edge: "rounded-edge", legs: "straight-legs" },
  cushion: "blush-floral",
  seamShare: 0.8,
};

function benchGame() {
  return withActiveGig({ ...settleStories(newTestGame()), coins: 300, reputation: 8 }, "rosalind");
}

describe("the window bench cushion", () => {
  it("adds an hour that carries the bench into a second day, the cosy tag, its colour and its seam to the sanding term", () => {
    const state = benchGame();
    const review = playToReview(state, lastGigId(state), BENCH_PLAN);
    const run = runOf(review);
    expect(run.stage).toBe("review");
    expect(review.calendar).toEqual({ day: 2, hoursLeft: 10 - 2 });
    expect(pieceTags(run)).toContain("cosy");
    expect(pieceColours(run)).toContain("blush");
    expect(cushionSeamAccuracy(run.cushion)).toBeCloseTo(0.8);
    expect(pieceQuality(review, run).sand).toBeCloseTo((1 + 0.8) / 2);
  });

  it("refunds the fabric when the cushion comes off, and needs a sewn seam to move on", () => {
    const state = benchGame();
    const atFinish = playUntil(state, lastGigId(state), BENCH_PLAN, "finish");
    const withCushion = reduce(atFinish, { type: "chooseCushion", fabricId: "sky-gingham" });
    expect(withCushion.coins).toBe(atFinish.coins - 11);
    const finished = reduce(withCushion, { type: "chooseFinish", finishId: "beeswax", paint: null });
    expect(reduce(finished, { type: "goToStage", stage: "review" })).toBe(finished);
    const off = reduce(finished, { type: "chooseCushion", fabricId: null });
    expect(off.coins).toBe(atFinish.coins - 5);
    expect(runOf(reduce(off, { type: "goToStage", stage: "review" })).stage).toBe("review");
  });

  it("only sews cushions for seats", () => {
    const state = withActiveGig(settleStories(newTestGame()), "grandpa-teodor");
    const atFinish = playUntil(state, lastGigId(state), BIRDHOUSE_PLAN, "finish");
    expect(reduce(atFinish, { type: "chooseCushion", fabricId: "sky-gingham" })).toBe(atFinish);
  });
});
