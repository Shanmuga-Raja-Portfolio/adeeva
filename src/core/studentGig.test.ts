import { describe, expect, it } from "vitest";
import { reduce } from "./reduce";
import { craftToReview, dispatchAll, newTestGame } from "./testPlaythrough";

describe("a scripted student gig from new game to delivery", () => {
  it("runs every craft step and commits each change exactly once", () => {
    const start = newTestGame();
    expect(start.calendar.day).toBe(1);
    expect(start.coins).toBe(120);
    expect(start.story.queue).toEqual(["thread-one"]);
    const offer = start.gigs.offers[0];
    if (offer === undefined) throw new Error("expected an offer on day one");

    const accepted = dispatchAll(start, [
      { type: "markBeatSeen", beatId: "thread-one" },
      { type: "acceptOffer", offerId: offer.id },
      { type: "startRun", gigId: offer.id },
    ]);
    expect(accepted.gigs.active.map((gig) => gig.id)).toEqual([offer.id]);
    expect(accepted.activeRun?.stage).toBe("brief");

    const review = craftToReview(accepted);
    const run = review.activeRun;
    expect(run?.stage).toBe("review");
    expect(review.calendar.hoursLeft).toBe(1);
    expect(review.inventory.fabricMetres["ivory-cotton"]).toBe(0.5);
    expect(run?.decorations).toHaveLength(
      offer.brief.requiredTrims.reduce((sum, requirement) => sum + requirement.count, 0),
    );

    const delivered = reduce(review, { type: "deliver" });
    const entry = delivered.log[delivered.log.length - 1];
    expect(entry?.reward?.outcome).toBe("pass");
    expect(entry?.evaluation.criteria.every((criterion) => criterion.passed)).toBe(true);
    expect(delivered.coins).toBe(review.coins + (entry?.reward?.coins ?? 0));
    expect(delivered.reputation).toBeGreaterThan(review.reputation);
    expect(delivered.gigsDelivered).toBe(1);
    expect(delivered.gigs.active).toEqual([]);
    expect(delivered.activeRun?.stage).toBe("done");
    expect(delivered.story.queue).toContain("out-the-door");
    for (const requirement of offer.brief.requiredTrims)
      expect(delivered.inventory.trims[requirement.trim]).toBe(0);

    expect(reduce(delivered, { type: "deliver" })).toBe(delivered);
  });
});
