import { describe, expect, it } from "vitest";
import { canDeliver } from "./delivery";
import { reduce } from "./reduce";
import { flipQuality } from "./flipQuality";
import {
  dispatchAll,
  newTestGame,
  playFlipToReview,
  settleStories,
  withActiveGig,
  type FlipPlan,
} from "./testPlaythrough";

const CUSHION_PLAN: FlipPlan = {
  design: { recipeId: "cushion-cover", parts: {} },
  findId: "linen-curtain",
  grade: "like-new",
  pullCm: 2,
  harshShare: 0,
  cut: "trace",
  seamAccuracy: 0.9,
};

describe("a full scripted order", () => {
  it("goes from a new game through every step to a paid delivery", () => {
    const fresh = settleStories(newTestGame({ seed: 11 }));
    const offer = fresh.gigs.offers[0];
    expect(offer).toBeDefined();
    expect(["nana-bea", "juniper-wren"]).toContain(offer?.clientId);
    const accepted = reduce(fresh, { type: "acceptOffer", offerId: offer?.id ?? "" });
    const gig = accepted.gigs.active[0];
    if (gig === undefined) throw new Error("No gig accepted");
    const plan: FlipPlan =
      gig.clientId === "nana-bea"
        ? CUSHION_PLAN
        : { ...CUSHION_PLAN, design: { recipeId: "scrunchie-trio", parts: {} } };
    const review = playFlipToReview(accepted, gig.id, plan);
    expect(review.activeRun?.stage).toBe("review");
    expect(canDeliver(review).ok).toBe(true);
    expect(review.calendar.hoursLeft).toBe(gig.clientId === "nana-bea" ? 10 - 8 : 10 - 7);
    const delivered = reduce(review, { type: "deliver" });
    expect(delivered.activeRun?.stage).toBe("done");
    const entry = delivered.log[0];
    expect(entry?.reward?.outcome).toBe("pass");
    expect(delivered.coins).toBeGreaterThan(review.coins);
    expect(delivered.reputation).toBeGreaterThan(review.reputation);
    expect(delivered.gigs.active).toHaveLength(0);
    expect(delivered.story.queue).toContain("tf-first-delivery");
    expect(delivered.stock.finds).toHaveLength(0);
  });

  it("scores a careful flip as high quality", () => {
    const state = withActiveGig(settleStories(newTestGame()), "nana-bea");
    const gigId = state.gigs.active[0]?.id ?? "";
    const review = playFlipToReview(state, gigId, CUSHION_PLAN);
    const run = review.activeRun;
    if (run === null) throw new Error("No run");
    const quality = flipQuality(review, run);
    expect(quality.unpick).toBe(1);
    expect(quality.cut).toBe(1);
    expect(quality.seams).toBe(0.9);
    expect(quality.quality).toBeGreaterThan(85);
  });

  it("is deterministic for the same seed and actions", () => {
    const play = () => {
      const state = withActiveGig(settleStories(newTestGame({ seed: 99 })), "nana-bea");
      const review = playFlipToReview(state, state.gigs.active[0]?.id ?? "", CUSHION_PLAN);
      return dispatchAll(review, [{ type: "deliver" }, { type: "endDay" }, { type: "endDay" }]);
    };
    expect(JSON.stringify(play())).toBe(JSON.stringify(play()));
  });
});
