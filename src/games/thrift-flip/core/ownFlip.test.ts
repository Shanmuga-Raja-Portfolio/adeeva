import { describe, expect, it } from "vitest";
import { canDeliver } from "./delivery";
import type { GameState } from "./gameState";
import { rackSize } from "./rackPiece";
import { reduce } from "./reduce";
import { newTestGame, playFlipToReview, runOf, settleStories, type FlipPlan } from "./testPlaythrough";

const TOTE: FlipPlan = {
  design: { recipeId: "tote-bag", parts: {} },
  findId: "linen-curtain",
  grade: "loved",
  pullCm: 2,
  harshShare: 0,
  cut: "assist",
  seamAccuracy: 0.85,
};

function racked(state: GameState): GameState {
  return reduce(playFlipToReview(state, null, TOTE), { type: "deliver" });
}

describe("pieces for the stall rack", () => {
  it("skips the brief, needs no client and hangs the piece on the rack", () => {
    const base = settleStories(newTestGame());
    const started = reduce(base, { type: "startOwnFlip" });
    expect(runOf(started).stage).toBe("design");
    expect(runOf(started).brief).toBeNull();
    const review = playFlipToReview(base, null, TOTE);
    expect(canDeliver(review).ok).toBe(true);
    const done = reduce(review, { type: "deliver" });
    expect(done.rack).toHaveLength(1);
    expect(done.rack[0]).toMatchObject({ recipeId: "tote-bag", cloth: { colour: "sage" } });
    expect(done.log[0]?.kind).toBe("own");
    expect(done.log[0]?.reward).toBeNull();
    expect(done.coins).toBe(review.coins);
    expect(done.flipsFinished).toBe(1);
  });

  it("refuses a new rack piece when every hook is used", () => {
    let state = settleStories(newTestGame());
    for (let piece = 0; piece < rackSize(state.upgrades); piece += 1)
      state = { ...racked(state), calendar: { ...state.calendar, hoursLeft: 10 } };
    expect(state.rack).toHaveLength(4);
    expect(reduce(state, { type: "startOwnFlip" })).toBe(state);
  });

  it("pins the Ten Rescued rosette after ten finished flips", () => {
    const state = { ...settleStories(newTestGame()), flipsFinished: 9 };
    const done = racked(state);
    expect(done.story.queue).toContain("tf-rack-of-ten");
  });
});
