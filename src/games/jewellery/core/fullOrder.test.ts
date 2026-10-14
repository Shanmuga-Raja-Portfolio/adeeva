import { describe, expect, it } from "vitest";
import { lastResult } from "./delivery";
import { reduce } from "./reduce";
import { GOOD_PLAN, lastGigId, newTestGame, playOrder, settleStories, withOrder } from "./testPlaythrough";

describe("a full scripted order", () => {
  it("goes from a new game to Gran Mina's delivered pendant in the Keepsake Case", () => {
    const start = settleStories(newTestGame({ trait: "charmer" }));
    const offer = start.gigs.offers[0];
    if (offer === undefined) throw new Error("No first offer");
    expect(offer.clientId).toBe("gran-mina");
    const accepted = reduce(start, { type: "acceptOffer", offerId: offer.id });
    const delivered = playOrder(accepted, offer.id, GOOD_PLAN);
    const run = delivered.activeRun;
    expect(run?.stage).toBe("done");
    const result = run === null ? null : lastResult(delivered, run.id);
    expect(result?.evaluation.passed).toBe(true);
    expect(result?.reward.outcome).toBe("pass");
    expect(result?.evaluation.quality.quality).toBeGreaterThanOrEqual(95);
    expect(result?.evaluation.stars).toBe(5);
    expect(delivered.coins).toBeGreaterThan(accepted.coins);
    expect(delivered.reputation).toBeGreaterThan(0);
    expect(delivered.keepsakes).toHaveLength(1);
    expect(delivered.keepsakes[0]?.line).toBe("It's perfect. I'm wearing it to tea right now.");
    expect(delivered.ordersDelivered).toBe(1);
    expect(delivered.gigs.active).toHaveLength(0);
    expect(delivered.story.queue).toEqual(["jb-first-delivery", "jb-charmer"]);
    expect(delivered.stock.metal.brass.sheet).toBe(0);
    expect(delivered.stock.stones.garnet).toBe(0);
    expect(delivered.stock.extras["fine-chain"]).toBe(0);
  });

  it("matches the day-one sanity check: brass, garnet and a fine chain cost 15 coins", () => {
    const start = withOrder(settleStories(newTestGame()), "gran-mina");
    const delivered = playOrder(start, lastGigId(start), GOOD_PLAN);
    const run = delivered.activeRun;
    const result = run === null ? null : lastResult(delivered, run.id);
    expect(result?.evaluation.spend).toBe(15);
    expect(result?.evaluation.favouredColoursUsed).toBeGreaterThanOrEqual(1);
    expect(delivered.calendar.day).toBe(1);
    expect(delivered.calendar.hoursLeft).toBe(10 - 1 - 1 - 2 - 1 - 1 - 1);
  });
});
