import { describe, expect, it } from "vitest";
import { reduce } from "./reduce";
import { lastResult } from "./reveal";
import { lastGigId, newTestGame, playOrder, recipeFor, settleStories, withOrder } from "./testPlaythrough";

describe("a full scripted makeover", () => {
  it("goes from a new game to Nana Pearl's revealed reading nook", () => {
    const start = settleStories(newTestGame({ trait: "charmer" }));
    const offer = start.gigs.offers[0];
    if (offer === undefined) throw new Error("No first offer");
    expect(offer.clientId).toBe("nana-pearl");
    const accepted = reduce(start, { type: "acceptOffer", offerId: offer.id });
    const revealed = playOrder(accepted, offer.id, recipeFor("nana-pearl"));
    const run = revealed.activeRun;
    expect(run?.stage).toBe("done");
    const result = run === null ? null : lastResult(revealed, run.id);
    expect(result?.evaluation.passed).toBe(true);
    expect(result?.reward.outcome).toBe("pass");
    expect(result?.evaluation.quality.quality).toBeGreaterThanOrEqual(90);
    expect(result?.evaluation.stars).toBe(5);
    expect(result?.reward.lines.map((line) => line.label)).toContain("Charmer tip");
    expect(revealed.coins).toBeGreaterThan(accepted.coins);
    expect(revealed.reputation).toBeGreaterThan(0);
    expect(revealed.ordersDelivered).toBe(1);
    expect(revealed.gigs.active).toHaveLength(0);
    expect(revealed.story.queue).toEqual(["is-first-reveal", "is-charmer"]);
    expect(revealed.stock.furniture.armchair).toBe(0);
    expect(revealed.stock.paints["chalk-white"]).toBe(0);
  });

  it("matches the day-one sanity check: 36 coins of materials and eight hours of work", () => {
    const start = withOrder(settleStories(newTestGame()), "nana-pearl");
    const revealed = playOrder(start, lastGigId(start), recipeFor("nana-pearl"));
    const run = revealed.activeRun;
    const result = run === null ? null : lastResult(revealed, run.id);
    expect(result?.evaluation.spend).toBe(36);
    expect(result?.evaluation.favouredColoursUsed).toBe(2);
    expect(result?.evaluation.criteria.every((criterion) => criterion.passed)).toBe(true);
    expect(revealed.calendar.day).toBe(1);
    expect(revealed.calendar.hoursLeft).toBe(2);
  });
});
