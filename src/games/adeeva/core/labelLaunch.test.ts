import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { canLaunchLabel } from "./labelLaunch";
import { reduce } from "./reduce";
import { craftToReview, newTestGame, withActiveGig } from "./testPlaythrough";

function almostReady(): GameState {
  return { ...newTestGame(), reputation: 39, gigsDelivered: 7, coins: 300 };
}

describe("launching a label", () => {
  it("needs reputation 40 and eight delivered gigs", () => {
    const student = newTestGame();
    expect(canLaunchLabel(student).reasons).toEqual(["Reach reputation 40.", "Deliver 8 more gigs."]);
    expect(reduce(student, { type: "launchLabel" })).toBe(student);
    const close = almostReady();
    expect(reduce(close, { type: "launchLabel" })).toBe(close);
  });

  it("offers the showcase after the qualifying delivery and launches from the story choice", () => {
    const base = withActiveGig(almostReady(), "mom");
    const gig = base.gigs.active[0];
    if (gig === undefined) throw new Error("expected a gig");
    const delivered = reduce(craftToReview(reduce(base, { type: "startRun", gigId: gig.id })), {
      type: "deliver",
    });
    expect(delivered.gigsDelivered).toBe(8);
    expect(delivered.reputation).toBeGreaterThanOrEqual(40);
    expect(delivered.story.queue).toContain("student-showcase");
    expect(reduce(delivered, { type: "markBeatSeen", beatId: "student-showcase" })).toBe(delivered);
    const launched = reduce(delivered, {
      type: "chooseStoryOption",
      beatId: "student-showcase",
      choiceId: "launch",
    });
    expect(launched.profile.career).toBe("label");
    expect(launched.coins).toBe(delivered.coins);
    expect(launched.inventory).toEqual(delivered.inventory);
    expect(launched.profile.trait).toBe(delivered.profile.trait);
    expect(launched.season?.number).toBe(1);
    expect(launched.story.flags).toContain("label-launch-accepted");
    expect(launched.story.queue).toEqual(expect.arrayContaining(["a-name-on-the-door", "new-season"]));
    expect(reduce(launched, { type: "launchLabel" })).toBe(launched);
  });

  it("can be postponed and launched later from the hub", () => {
    const ready: GameState = { ...newTestGame(), reputation: 40, gigsDelivered: 8 };
    const later = reduce(
      { ...ready, story: { ...ready.story, queue: ["student-showcase"] } },
      { type: "chooseStoryOption", beatId: "student-showcase", choiceId: "not-yet" },
    );
    expect(later.profile.career).toBe("student");
    expect(later.story.flags).toContain("label-launch-later");
    expect(reduce(later, { type: "launchLabel" }).profile.career).toBe("label");
  });
});

describe("showcase choice regressions", () => {
  it("rejects the launch choice while the label cannot launch, keeping the beat", () => {
    const fresh = newTestGame();
    const queued: GameState = { ...fresh, story: { ...fresh.story, queue: ["student-showcase"] } };
    const rejected = reduce(queued, {
      type: "chooseStoryOption",
      beatId: "student-showcase",
      choiceId: "launch",
    });
    expect(rejected).toBe(queued);
    expect(rejected.story.queue).toContain("student-showcase");
  });
});
