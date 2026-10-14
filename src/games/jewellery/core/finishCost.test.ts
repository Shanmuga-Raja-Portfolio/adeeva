import { describe, expect, it } from "vitest";
import { canDeliver, canFinishStall } from "./delivery";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { canAdvance } from "./stageReadiness";
import {
  GOOD_PLAN,
  lastGigId,
  newTestGame,
  playRunTo,
  settleStories,
  withOrder,
  workStage,
} from "./testPlaythrough";

const GLAZED = { ...GOOD_PLAN, finish: "glaze", glaze: "sage" } as const;

function glazedStall(): GameState {
  const started = reduce(settleStories(newTestGame()), { type: "startStall", productId: "stack-ring" });
  const plan = { ...GLAZED, stoneId: null, chain: null };
  return workStage(playRunTo(started, plan, "display"), plan);
}

function glazedOrderAt(stage: "display" | "review"): GameState {
  const ordered = withOrder(settleStories(newTestGame()), "gran-mina");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  const atDisplay = workStage(playRunTo(started, GLAZED, "display"), GLAZED);
  return stage === "display" ? atDisplay : reduce(atDisplay, { type: "goToStage", stage: "review" });
}

describe("finish prices", () => {
  it("keep a stall piece on the bench until the finish is affordable", () => {
    const broke: GameState = { ...glazedStall(), coins: 3 };
    expect(canFinishStall(broke).reasons).toContain("You need 4 coins for the Colour Glaze finish.");
    expect(reduce(broke, { type: "finishStall" })).toBe(broke);
    const paid = reduce({ ...broke, coins: 4 }, { type: "finishStall" });
    expect(paid.activeRun?.stage).toBe("done");
    expect(paid.coins).toBe(0);
  });

  it("stop an order leaving the display step or being delivered without the coins", () => {
    const display: GameState = { ...glazedOrderAt("display"), coins: 0 };
    expect(canAdvance(display).ok).toBe(false);
    expect(reduce(display, { type: "goToStage", stage: "review" })).toBe(display);
    const review: GameState = { ...glazedOrderAt("review"), coins: 2 };
    expect(review.activeRun?.stage).toBe("review");
    expect(canDeliver(review).reasons).toContain("You need 4 coins for the Colour Glaze finish.");
    expect(reduce(review, { type: "deliver" })).toBe(review);
  });

  it("let a free finish through even when rent has left the purse empty", () => {
    const ordered = withOrder(settleStories(newTestGame()), "gran-mina");
    const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
    const display = workStage(playRunTo(started, GOOD_PLAN, "display"), GOOD_PLAN);
    const owing: GameState = { ...display, coins: -30 };
    expect(canAdvance(owing).ok).toBe(true);
  });
});
