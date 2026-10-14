import { describe, expect, it } from "vitest";
import { boutiqueRuleReasons, canOpenBoutique, nextWeekStart, weekStartReason } from "./boutiqueUnlock";
import {
  endDays,
  offerQueued,
  openedBoutique,
  settleWithChoice,
  stallDayAtThreshold,
  TEST_SIGN,
} from "./boutiquePlaythrough";
import { weeklyBill } from "./calendar";
import { reduce } from "./reduce";
import { currentBeat } from "./storyQueue";
import { newTestGame, settleStories, withActiveGig } from "./testPlaythrough";

describe("the boutique unlock rule", () => {
  it("lists what is still missing in kind words", () => {
    const fresh = settleStories(newTestGame());
    expect(boutiqueRuleReasons(fresh)).toEqual([
      "Earn 40 more reputation.",
      "Deliver 10 more orders.",
      "Sell 3 more pieces at a fair price.",
    ]);
    expect(boutiqueRuleReasons({ ...fresh, reputation: 39, gigsDelivered: 9, fairSales: 2 })).toEqual([
      "Earn 1 more reputation.",
      "Deliver 1 more order.",
      "Sell 1 more piece at a fair price.",
    ]);
    expect(boutiqueRuleReasons({ ...fresh, reputation: 40, gigsDelivered: 10, fairSales: 3 })).toEqual([]);
  });

  it("queues the offer only when a Stall Day ends with the rule passing", () => {
    const ready = stallDayAtThreshold();
    expect(ready.calendar.day).toBe(7);
    expect(currentBeat(ready)).toBeNull();
    const next = reduce(ready, { type: "endDay" });
    expect(next.story.queue).toContain("tf-boutique-offer");
    expect(currentBeat(settleStories(next))?.id).toBe("tf-boutique-offer");
    expect(next.calendar).toMatchObject({ day: 8, hoursLeft: 10 });
    const short = reduce({ ...ready, fairSales: 2 }, { type: "endDay" });
    expect(short.story.queue).not.toContain("tf-boutique-offer");
  });

  it("opens the boutique from the offer with a sign, keeping coins, orders and the bench", () => {
    const offered = offerQueued();
    const withGig = withActiveGig(offered, "ms-okafor");
    const opened = settleWithChoice(withGig, "open");
    expect(opened.profile.career).toBe("boutique");
    expect(opened.boutique?.signId).toBe(TEST_SIGN);
    expect(opened.boutique?.openedDay).toBe(8);
    expect(opened.boutique?.season).toMatchObject({ number: 1, startDay: 8, themeId: "seaside-swap" });
    expect(opened.coins).toBe(withGig.coins);
    expect(opened.reputation).toBe(withGig.reputation);
    expect(opened.gigs.active).toEqual(withGig.gigs.active);
    expect(opened.story.seen).toEqual(
      expect.arrayContaining(["tf-boutique-offer", "tf-boutique-opened", "tf-showcase-invite"]),
    );
  });

  it("makes the welcome week rent-free, then charges shop rent", () => {
    const opened = openedBoutique();
    expect(weeklyBill(opened)).toBe(0);
    const tillDay = endDays(opened, 6);
    expect(tillDay.calendar.day).toBe(14);
    const afterWelcome = endDays(tillDay, 1);
    expect(afterWelcome.coins).toBe(tillDay.coins);
    expect(weeklyBill(afterWelcome)).toBe(160);
  });

  it("keeps the offer open after 'Not yet' and opens from the hub at a week start", () => {
    const later = settleWithChoice(offerQueued(), "later");
    expect(later.profile.career).toBe("stall");
    expect(later.story.flags).toContain("boutique-later");
    expect(canOpenBoutique(later).ok).toBe(true);
    const opened = reduce(later, { type: "openBoutique", signId: "patch-and-pocket" });
    expect(opened.boutique?.signId).toBe("patch-and-pocket");
  });

  it("returns the same state for every illegal opening", () => {
    const later = settleWithChoice(offerQueued(), "later");
    const midWeek = settleStories(reduce(later, { type: "endDay" }));
    expect(canOpenBoutique(midWeek).reasons).toEqual([weekStartReason(midWeek.calendar.day)]);
    expect(canOpenBoutique(midWeek).reasons[0]).toContain(`on day ${nextWeekStart(midWeek.calendar.day)}`);
    expect([nextWeekStart(1), nextWeekStart(9), nextWeekStart(14), nextWeekStart(15)]).toEqual([
      8, 15, 15, 22,
    ]);
    expect(reduce(midWeek, { type: "openBoutique", signId: TEST_SIGN })).toBe(midWeek);
    const afternoon = { ...later, calendar: { ...later.calendar, hoursLeft: 9 } };
    expect(reduce(afternoon, { type: "openBoutique", signId: TEST_SIGN })).toBe(afternoon);
    const fresh = settleStories(newTestGame());
    expect(reduce(fresh, { type: "openBoutique", signId: TEST_SIGN })).toBe(fresh);
    expect(reduce(later, { type: "openBoutique", signId: "sparkle-shop" as typeof TEST_SIGN })).toBe(later);
    const opened = reduce(later, { type: "openBoutique", signId: TEST_SIGN });
    expect(reduce(opened, { type: "openBoutique", signId: TEST_SIGN })).toBe(opened);
  });

  it("never lets the offer be skipped without a choice", () => {
    const offered = offerQueued();
    expect(reduce(offered, { type: "markBeatSeen", beatId: "tf-boutique-offer" })).toBe(offered);
    expect(
      reduce(offered, {
        type: "chooseStoryOption",
        beatId: "tf-boutique-offer",
        choiceId: "open",
        signId: null,
      }),
    ).toBe(offered);
    expect(
      reduce(offered, {
        type: "chooseStoryOption",
        beatId: "tf-boutique-offer",
        choiceId: "maybe",
        signId: null,
      }),
    ).toBe(offered);
  });
});
