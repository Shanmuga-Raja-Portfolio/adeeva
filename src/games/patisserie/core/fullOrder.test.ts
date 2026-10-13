import { describe, expect, it } from "vitest";
import { lastResult } from "./delivery";
import { reduce } from "./reduce";
import { GOOD_PLAN, lastGigId, newTestGame, playOrder, settleStories, withOrder } from "./testPlaythrough";

describe("a full scripted order", () => {
  it("goes from a new game to a delivered, rewarded bake in the Bake Book", () => {
    const start = settleStories(newTestGame({ difficulty: "standard", trait: "charmer" }));
    const offer = start.gigs.offers[0];
    expect(offer).toBeDefined();
    if (offer === undefined) return;
    expect(["pip", "coach-dani"]).toContain(offer.clientId);
    const accepted = reduce(start, { type: "acceptOffer", offerId: offer.id });
    const productId = offer.brief.products[0] ?? "cupcake-tray";
    const delivered = playOrder(accepted, offer.id, {
      ...GOOD_PLAN,
      productId,
      mixIds: [productId === "iced-biscuits" ? "biscuit-dough" : "vanilla-sponge"],
      fillingId: null,
      colours: offer.brief.favouredColours.slice(0, 2),
    });
    const run = delivered.activeRun;
    expect(run?.stage).toBe("done");
    const result = run === null ? null : lastResult(delivered, run.id);
    expect(result?.evaluation.passed).toBe(true);
    expect(result?.reward.outcome).toBe("pass");
    expect(delivered.coins).toBeGreaterThan(accepted.coins - 40);
    expect(delivered.reputation).toBeGreaterThan(0);
    expect(delivered.bakeBook).toHaveLength(1);
    expect(delivered.ordersDelivered).toBe(1);
    expect(delivered.gigs.active).toHaveLength(0);
    expect(delivered.story.queue).toContain("pa-first-delivery");
  });

  it("bakes a two-tier cake across two days with both tiers stacked and piped", () => {
    const start = withOrder(settleStories(newTestGame({ difficulty: "relaxed" })), "rosa-mateo");
    const delivered = playOrder(start, lastGigId(start), {
      ...GOOD_PLAN,
      productId: "two-tier-cake",
      mixIds: ["cocoa-sponge", "vanilla-sponge"],
      fillingId: "raspberry-jam",
      colours: ["navy", "gold"],
    });
    const run = delivered.activeRun;
    expect(run?.stage).toBe("done");
    expect(delivered.calendar.day).toBeGreaterThan(1);
    expect(run?.stack).toEqual({ stand: "big-tier", "on-top": "small-tier" });
    expect(Object.keys(run?.pipes ?? {})).toHaveLength(3);
    const result = run === null ? null : lastResult(delivered, run.id);
    expect(result?.evaluation.quality.quality).toBeGreaterThan(80);
  });
});
