import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import { canWorkShift, endDay, weeklyBill } from "./calendar";
import { hoursPerDay } from "./dayHours";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { assistantHireCost } from "./studio";
import { dispatchAll, newTestGame, withActiveGig } from "./testPlaythrough";
import { visibleNextTrends } from "../../../engine/trendMarket";

function endDays(state: GameState, count: number): GameState {
  return Array.from({ length: count }).reduce<GameState>((current) => endDay(current), state);
}

describe("end of day", () => {
  it("advances the day and restores the hours", () => {
    const tired: GameState = { ...newTestGame(), calendar: { day: 1, hoursLeft: 2, shopOpen: true } };
    const next = reduce(tired, { type: "endDay" });
    expect(next.calendar).toEqual({ day: 2, hoursLeft: 10, shopOpen: false });
  });

  it("charges the wage at hire, then rent and wage when day 7 ends", () => {
    const hired = reduce(newTestGame(), { type: "hireAssistant" });
    expect(hired.coins).toBe(90);
    expect(hired.studio.assistantPaidThroughDay).toBe(7);
    const day7 = endDays(hired, 6);
    expect(day7.calendar.day).toBe(7);
    expect(day7.coins).toBe(90);
    const day8 = endDay(day7);
    expect(day8.coins).toBe(90 - 80 - 30);
    expect(day8.studio.assistantPaidThroughDay).toBe(14);
    expect(endDays(day8, 6).coins).toBe(day8.coins);
    expect(endDays(day8, 7).coins).toBe(day8.coins - 110);
  });

  it("closes the hire-then-fire wage dodge", () => {
    const start: GameState = { ...newTestGame(), coins: 300 };
    const dodged = dispatchAll(start, [{ type: "hireAssistant" }, { type: "fireAssistant" }]);
    expect(dodged.coins).toBe(270);
    const rehired = reduce(endDays(dodged, 3), { type: "hireAssistant" });
    expect(rehired.coins).toBe(270);
    const nextWeek = endDays(reduce(rehired, { type: "fireAssistant" }), 4);
    expect(nextWeek.calendar.day).toBe(8);
    expect(nextWeek.coins).toBe(270 - 80);
    expect(reduce(nextWeek, { type: "hireAssistant" }).coins).toBe(nextWeek.coins - 30);
    const broke: GameState = { ...start, coins: 10 };
    expect(reduce(broke, { type: "hireAssistant" })).toBe(broke);
  });

  it("scales rent by difficulty", () => {
    const relaxed = endDays(newTestGame({ difficulty: "relaxed" }), 7);
    expect(relaxed.coins).toBe(120);
    const challenging = endDays(newTestGame({ difficulty: "challenging" }), 7);
    expect(challenging.coins).toBe(120 - 120);
    const label = endDays(newTestGame({ career: "label" }), 7);
    expect(label.coins).toBe(600 - 250);
  });

  it("charges no assistant wage on Relaxed, at hire or weekly, so coins never go negative", () => {
    const relaxed = newTestGame({ difficulty: "relaxed" });
    expect(assistantHireCost(relaxed)).toBe(0);
    const hired = reduce(relaxed, { type: "hireAssistant" });
    expect(hired.studio.assistantHired).toBe(true);
    expect(hired.coins).toBe(120);
    expect(weeklyBill(hired)).toEqual({ rent: 0, wage: 0 });
    expect(endDays(hired, 14).coins).toBe(120);
  });

  it("scales the assistant wage with the difficulty rent multiplier", () => {
    const challenging = reduce(newTestGame({ difficulty: "challenging" }), { type: "hireAssistant" });
    expect(challenging.coins).toBe(120 - 45);
    expect(weeklyBill(challenging)).toEqual({ rent: 120, wage: 45 });
  });

  it("lets buzz fade by 2 a day, never below zero", () => {
    const buzzing: GameState = { ...newTestGame(), buzz: 5 };
    expect(endDay(buzzing).buzz).toBe(3);
    expect(endDays(buzzing, 2).buzz).toBe(1);
    expect(endDays(buzzing, 3).buzz).toBe(0);
    expect(endDays(buzzing, 4).buzz).toBe(0);
  });

  it("rolls the trend market weekly and queues the first-week beat", () => {
    const start = newTestGame();
    const day7 = endDays(start, 6);
    expect(day7.trends).toEqual(start.trends);
    const day8 = endDay(day7);
    expect(day8.trends.current).toEqual(start.trends.next);
    expect(day8.trends.next).toHaveLength(2);
    expect(day8.story.queue).toContain("seven-days");
  });

  it("queues the bankrupt beat on Challenging when rent empties the purse", () => {
    const broke: GameState = { ...newTestGame({ difficulty: "challenging" }), coins: 10 };
    const after = endDays(broke, 7);
    expect(after.coins).toBe(-110);
    expect(after.story.queue).toContain("tight-week");
    const standard = endDays({ ...newTestGame(), coins: 10 }, 7);
    expect(standard.story.queue).not.toContain("tight-week");
  });

  it("expires old offers and lapses overdue gigs on Standard", () => {
    const start = withActiveGig(newTestGame(), "mom");
    const gig = start.gigs.active[0];
    if (gig === undefined) throw new Error("expected a gig");
    const dayOneOffers = start.gigs.offers.map((offer) => offer.id);
    const later = endDays(start, 3);
    expect(later.gigs.offers.some((offer) => dayOneOffers.includes(offer.id))).toBe(false);
    const lapsed = endDays(start, gig.brief.deadlineDay + 3);
    expect(lapsed.gigs.active.some((entry) => entry.id === gig.id)).toBe(false);
    expect(lapsed.gigs.lapsed).toContainEqual(expect.objectContaining({ gigId: gig.id, reputation: -1 }));
    const relaxed = endDays(withActiveGig(newTestGame({ difficulty: "relaxed" }), "mom"), 12);
    expect(relaxed.gigs.active).toHaveLength(1);
  });
});

describe("trend preview", () => {
  it("shows next week's trends only to the Trendsetter", () => {
    const trendsetter = newTestGame({ trait: "trendsetter" });
    expect(visibleNextTrends(trendsetter)).toEqual(trendsetter.trends.next);
    expect(visibleNextTrends(newTestGame({ trait: "charmer" }))).toBeNull();
  });
});

describe("part-time shift", () => {
  it("pays and uses the whole day", () => {
    const start = newTestGame();
    const worked = reduce(start, { type: "workShift" });
    expect(worked.coins).toBe(155);
    expect(worked.calendar.day).toBe(2);
  });

  it("lets a broke Relaxed player earn again with an untouched day", () => {
    const broke: GameState = { ...newTestGame({ difficulty: "relaxed" }), coins: 0 };
    expect(canWorkShift(broke).ok).toBe(true);
    const worked = reduce(broke, { type: "workShift" });
    expect(worked.coins).toBe(35);
    expect(worked.calendar.day).toBe(2);
    const started = reduce(broke, { type: "openShop" });
    expect(reduce(started, { type: "workShift" })).toBe(started);
  });

  it("is unavailable once the day has started", () => {
    const busy = reduce(newTestGame(), { type: "openShop" });
    expect(canWorkShift(busy).ok).toBe(false);
    expect(reduce(busy, { type: "workShift" })).toBe(busy);
  });
});

describe("studio", () => {
  it("hires and fires the assistant once", () => {
    const hired = reduce(newTestGame(), { type: "hireAssistant" });
    expect(reduce(hired, { type: "hireAssistant" })).toBe(hired);
    const fired = reduce(hired, { type: "fireAssistant" });
    expect(fired.studio.assistantHired).toBe(false);
    expect(reduce(fired, { type: "fireAssistant" })).toBe(fired);
  });

  it("gates upgrades by reputation and coins and adds the mood-board hour", () => {
    const poor = newTestGame();
    expect(reduce(poor, { type: "buyUpgrade", upgradeId: "big-table" })).toBe(poor);
    const rich: GameState = { ...poor, coins: 9999, reputation: 99 };
    const bogus = JSON.parse('{"type":"buyUpgrade","upgradeId":"gold-throne"}') as Action;
    expect(reduce(rich, bogus)).toBe(rich);
    const ready: GameState = { ...poor, coins: 500, reputation: 12 };
    const bought = dispatchAll(ready, [
      { type: "buyUpgrade", upgradeId: "mood-board" },
      { type: "buyUpgrade", upgradeId: "mood-board" },
    ]);
    expect(bought.coins).toBe(280);
    expect(bought.calendar.hoursLeft).toBe(11);
    expect(hoursPerDay(bought.studio)).toBe(11);
    expect(endDay(bought).calendar.hoursLeft).toBe(11);
  });
});
