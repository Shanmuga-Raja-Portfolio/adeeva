import { describe, expect, it } from "vitest";
import { fuzzSaves } from "../../../engine/saveFuzz";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import { newTestGame, playFlipToReview, settleStories, withActiveGig } from "./testPlaythrough";

function samples(): GameState[] {
  const fresh = newTestGame();
  const state = withActiveGig(settleStories(fresh), "nana-bea");
  const review = playFlipToReview(state, state.gigs.active[0]?.id ?? "", {
    design: { recipeId: "cushion-cover", parts: {} },
    findId: "check-coat",
    grade: "tired",
    pullCm: 2,
    harshShare: 0.2,
    cut: "trace",
    seamAccuracy: 0.85,
  });
  return [fresh, review, reduce(review, { type: "deliver" })];
}

describe("save fuzzing", () => {
  it("loads or cleanly refuses every hostile save and never touches shared prototypes", () => {
    const target = {
      parse: parseSave,
      serialize,
      newestVersion: SCHEMA_VERSION,
      afterLoad: (state: GameState) => reduce(state, { type: "endDay" }),
    };
    const report = fuzzSaves(target, samples(), 0x7f11, 500);
    expect(report.failures).toEqual([]);
    expect(report.accepted).toBeGreaterThan(0);
    expect(report.rejected).toBeGreaterThan(report.tried / 2);
  }, 120_000);
});
