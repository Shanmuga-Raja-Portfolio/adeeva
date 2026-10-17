import { describe, expect, it } from "vitest";
import type { DifficultyId } from "../../../engine/difficulty";
import { weeklyBill } from "./calendar";
import { dayLength } from "./calendarHours";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { newTestGame, settleStories } from "./testPlaythrough";

function endDays(state: GameState, days: number): GameState {
  let next = state;
  for (let day = 0; day < days; day += 1) next = reduce(next, { type: "endDay" });
  return next;
}

describe("the calendar", () => {
  it("charges 90 rent each week on Standard, 135 on Challenging and none on Relaxed", () => {
    const bills: Record<DifficultyId, number> = { relaxed: 0, standard: 90, challenging: 135 };
    for (const [difficulty, bill] of Object.entries(bills) as [DifficultyId, number][]) {
      const state = settleStories(newTestGame({ difficulty }));
      expect(weeklyBill(state)).toBe(bill);
      const sixth = endDays(state, 6);
      expect(sixth.coins).toBe(state.coins);
      expect(endDays(sixth, 1).coins).toBe(state.coins - bill);
    }
  });

  it("queues Market Morning on day seven and rolls a new theme and trends each week", () => {
    const state = settleStories(newTestGame());
    const marketDay = endDays(state, 6);
    expect(marketDay.calendar.day).toBe(7);
    expect(marketDay.story.queue).toContain("jb-first-market");
    const nextWeek = endDays(marketDay, 1);
    expect(nextWeek.marketTheme).not.toBe(marketDay.marketTheme);
    expect(nextWeek.trends.current).toEqual(marketDay.trends.next);
  });

  it("pays 30 for a whole untouched day at the Bead Barn", () => {
    const state = settleStories(newTestGame());
    const worked = reduce(state, { type: "workShift" });
    expect(worked.coins).toBe(state.coins + 30);
    expect(worked.calendar.day).toBe(2);
    const busy = { ...state, calendar: { ...state.calendar, hoursLeft: 9 } };
    expect(reduce(busy, { type: "workShift" })).toBe(busy);
  });

  it("gives an extra hour every day with the Comfy Bench Stool", () => {
    const state = { ...settleStories(newTestGame()), coins: 500, reputation: 26 };
    const stool = reduce(state, { type: "buyUpgrade", upgradeId: "comfy-stool" });
    expect(stool.coins).toBe(280);
    expect(dayLength(stool)).toBe(11);
    expect(reduce(stool, { type: "endDay" }).calendar.hoursLeft).toBe(11);
    expect(reduce(stool, { type: "buyUpgrade", upgradeId: "comfy-stool" })).toBe(stool);
  });

  it("offers A Quiet Week on Challenging when the coin jar runs dry, without ending the game", () => {
    const state = { ...settleStories(newTestGame({ difficulty: "challenging" })), coins: 20 };
    const week = endDays(state, 7);
    expect(week.coins).toBeLessThan(0);
    expect(week.story.queue).toContain("jb-lean-week");
    expect(reduce(settleStories(week), { type: "workShift" }).coins).toBe(week.coins + 30);
  });

  it("buys stall decor once at a fixed price", () => {
    const state = { ...settleStories(newTestGame()), coins: 100 };
    const lanterns = reduce(state, { type: "buyDecor", decorId: "lantern-string" });
    expect(lanterns.coins).toBe(60);
    expect(lanterns.decor).toEqual(["lantern-string"]);
    expect(reduce(lanterns, { type: "buyDecor", decorId: "lantern-string" })).toBe(lanterns);
    expect(reduce(lanterns, { type: "buyDecor", decorId: "velvet-awning" })).toBe(lanterns);
  });
});
