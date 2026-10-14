import { describe, expect, it } from "vitest";
import { canDeliver } from "./delivery";
import { pieceQuality } from "./pieceQuality";
import { reduce } from "./reduce";
import {
  BIRDHOUSE_PLAN,
  dispatchAll,
  newTestGame,
  playToReview,
  runOf,
  settleStories,
} from "./testPlaythrough";

describe("a full scripted commission", () => {
  it("goes from a new game through every step to a paid delivery", () => {
    const fresh = settleStories(newTestGame());
    expect(fresh.gigs.offers).toHaveLength(1);
    const offer = fresh.gigs.offers[0];
    expect(offer?.clientId).toBe("grandpa-teodor");
    const accepted = reduce(fresh, { type: "acceptOffer", offerId: offer?.id ?? "" });
    const gig = accepted.gigs.active[0];
    if (gig === undefined) throw new Error("No gig accepted");
    const review = playToReview(accepted, gig.id, BIRDHOUSE_PLAN);
    expect(runOf(review).stage).toBe("review");
    expect(canDeliver(review).ok).toBe(true);
    expect(review.calendar).toEqual({ day: 1, hoursLeft: 0 });
    expect(review.coins).toBe(100 - 6 - 4);
    expect(review.boards).toHaveLength(0);
    const delivered = reduce(review, { type: "deliver" });
    expect(runOf(delivered).stage).toBe("done");
    const entry = delivered.log[0];
    expect(entry?.reward.outcome).toBe("pass");
    expect(entry?.evaluation.passed).toBe(true);
    expect(delivered.coins).toBeGreaterThan(review.coins);
    expect(delivered.reputation).toBeGreaterThan(0);
    expect(delivered.gigs.active).toHaveLength(0);
    expect(delivered.story.queue).toContain("ww-first-delivery");
    expect(reduce(delivered, { type: "deliver" })).toBe(delivered);
  });

  it("scores a careful hand-made piece highly", () => {
    const fresh = settleStories(newTestGame());
    const accepted = reduce(fresh, { type: "acceptOffer", offerId: fresh.gigs.offers[0]?.id ?? "" });
    const review = playToReview(accepted, accepted.gigs.active[0]?.id ?? "", BIRDHOUSE_PLAN);
    const quality = pieceQuality(review, runOf(review));
    expect(quality.saw).toBe(1);
    expect(quality.join).toBe(1);
    expect(quality.sand).toBe(1);
    expect(quality.grain).toBe(1);
    expect(quality.woodFit).toBe(1);
    expect(quality.quality).toBe(100);
  });

  it("is deterministic for the same seed and actions", () => {
    const play = () => {
      const fresh = settleStories(newTestGame({ seed: 99 }));
      const accepted = reduce(fresh, { type: "acceptOffer", offerId: fresh.gigs.offers[0]?.id ?? "" });
      const review = playToReview(accepted, accepted.gigs.active[0]?.id ?? "", {
        ...BIRDHOUSE_PLAN,
        layout: "show-me",
        saw: "assist",
      });
      return dispatchAll(review, [{ type: "deliver" }, { type: "endDay" }, { type: "endDay" }]);
    };
    expect(JSON.stringify(play())).toBe(JSON.stringify(play()));
  });
});
