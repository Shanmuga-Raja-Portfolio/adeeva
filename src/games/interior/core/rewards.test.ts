import type { DifficultyId } from "../../../engine/difficulty";
import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { lastResult } from "./reveal";
import {
  lastGigId,
  newTestGame,
  playOrder,
  playRunTo,
  recipeFor,
  settleStories,
  withOrder,
  type RoomRecipe,
} from "./testPlaythrough";

function reveal(difficulty: DifficultyId, recipe: RoomRecipe, lateDays = 0) {
  const ordered = withOrder(settleStories(newTestGame({ difficulty, trait: "perfectionist" })), "nana-pearl");
  const gigId = lastGigId(ordered);
  if (lateDays === 0) return result(playOrder(ordered, gigId, recipe));
  const started = reduce(ordered, { type: "startOrder", gigId });
  let atReveal: GameState = playRunTo(started, recipe, "reveal");
  for (let day = 0; day < lateDays; day += 1) atReveal = settleStories(reduce(atReveal, { type: "endDay" }));
  return result(reduce(atReveal, { type: "reveal" }));
}

function result(state: GameState) {
  const run = state.activeRun;
  const entry = run === null ? null : lastResult(state, run.id);
  if (entry === null) throw new Error("no result");
  return { state, entry };
}

const MISSING_TAG: RoomRecipe = {
  ...recipeFor("nana-pearl"),
  furniture: ["bookcase", "desk"],
  lights: ["paper-pendant"],
};

describe("rewards per difficulty", () => {
  it("pays a pass on Standard with fee, reputation and buzz", () => {
    const { entry } = reveal("standard", recipeFor("nana-pearl"));
    expect(entry.reward.outcome).toBe("pass");
    const fee = entry.reward.lines.find((line) => line.label === "Fee")?.amount ?? 0;
    expect(fee).toBeGreaterThan(50);
    expect(entry.reward.reputation).toBe(1 + Math.round((2 * entry.evaluation.score) / 100));
    expect(entry.reward.buzz).toBeGreaterThanOrEqual(1 + entry.evaluation.stars);
  });

  it("pays 40% with a kind note on a Standard near miss", () => {
    const { entry } = reveal("standard", MISSING_TAG);
    expect(entry.evaluation.passed).toBe(false);
    expect(entry.reward.outcome).toBe("soft-fail");
    expect(entry.reward.reputation).toBe(-1);
    expect(entry.evaluation.feedback.some((line) => line.includes("So close!"))).toBe(true);
  });

  it("counts every reveal as a pass on Relaxed", () => {
    const { entry } = reveal("relaxed", MISSING_TAG);
    expect(entry.evaluation.passed).toBe(false);
    expect(entry.reward.outcome).toBe("pass");
  });

  it("pays nothing for a Challenging miss and halves a late fee", () => {
    const missed = reveal("challenging", MISSING_TAG).entry;
    expect(missed.reward.outcome).toBe("fail");
    expect(missed.reward.coins).toBe(0);
    expect(missed.reward.reputation).toBe(-3);
    const late = reveal("challenging", recipeFor("nana-pearl"), 6).entry;
    expect(late.evaluation.criteria.find((criterion) => criterion.id === "deadline")?.passed).toBe(false);
    expect(late.reward.lines.some((line) => line.label === "Late delivery")).toBe(true);
  });

  it("raises the minimum quality on Challenging", () => {
    const standard = withOrder(settleStories(newTestGame()), "nana-pearl").gigs.active[0];
    const challenging = withOrder(settleStories(newTestGame({ difficulty: "challenging" })), "nana-pearl")
      .gigs.active[0];
    expect((challenging?.brief.minQuality ?? 0) - (standard?.brief.minQuality ?? 0)).toBe(6);
  });
});
