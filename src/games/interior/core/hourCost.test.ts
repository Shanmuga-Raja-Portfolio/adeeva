import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { lastGigId, newTestGame, playRunTo, recipeFor, settleStories, withOrder } from "./testPlaythrough";

function hours(state: GameState): number {
  return state.calendar.hoursLeft;
}

describe("step hours", () => {
  it("charges the plan once but the warehouse on every visit", () => {
    const ordered = withOrder(settleStories(newTestGame()), "nana-pearl");
    const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
    const atPaint = playRunTo(started, recipeFor("nana-pearl"), "paint");
    expect(hours(atPaint)).toBe(hours(started) - 2);
    const backToPlan = reduce(atPaint, { type: "goToStage", stage: "plan" });
    expect(hours(backToPlan)).toBe(hours(atPaint));
    const atShop = reduce(backToPlan, { type: "goToStage", stage: "shop" });
    expect(hours(atShop)).toBe(hours(atPaint));
    const paintAgain = reduce(atShop, { type: "goToStage", stage: "paint" });
    expect(paintAgain.activeRun?.stage).toBe("paint");
    expect(hours(paintAgain)).toBe(hours(atPaint) - 1);
  });
});
