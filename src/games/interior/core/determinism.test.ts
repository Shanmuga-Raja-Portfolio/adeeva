import { describe, expect, it } from "vitest";
import { reduce } from "./reduce";
import { serialize } from "./save";
import { lastGigId, newTestGame, playOrder, recipeFor, settleStories, withOrder } from "./testPlaythrough";

function season(seed: number): string {
  const ordered = withOrder(settleStories(newTestGame({ seed })), "nana-pearl");
  let state = playOrder(ordered, lastGigId(ordered), recipeFor("nana-pearl"));
  for (let day = 0; day < 9; day += 1) state = settleStories(reduce(state, { type: "endDay" }));
  return serialize(state);
}

describe("determinism", () => {
  it("replays the same seed and actions to the very same game", () => {
    expect(season(41)).toBe(season(41));
  });

  it("varies trends and briefs with the seed", () => {
    const first = newTestGame({ seed: 1 });
    const others = [2, 3, 4, 5, 6].map((seed) => newTestGame({ seed }));
    const differs = others.some(
      (state) =>
        state.trends.current.join() !== first.trends.current.join() ||
        state.gigs.offers[0]?.brief.fee !== first.gigs.offers[0]?.brief.fee,
    );
    expect(differs).toBe(true);
  });
});
