import { describe, expect, it } from "vitest";
import { dayLength, weeklyBill } from "./calendar";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { newTestGame, settleStories } from "./testPlaythrough";
import { buyLoftDecor } from "./loftShop";

function endDays(state: GameState, days: number): GameState {
  let next = state;
  for (let day = 0; day < days; day += 1) next = settleStories(reduce(next, { type: "endDay" }));
  return next;
}

describe("calendar", () => {
  it("charges rent at the end of the seventh day by difficulty", () => {
    expect(weeklyBill(newTestGame({ difficulty: "relaxed" }))).toBe(0);
    expect(weeklyBill(newTestGame())).toBe(90);
    expect(weeklyBill(newTestGame({ difficulty: "challenging" }))).toBe(135);
    const start = settleStories(newTestGame());
    const week = endDays(start, 7);
    expect(week.calendar.day).toBe(8);
    expect(week.coins).toBe(start.coins - 90);
    expect(week.story.seen).toContain("is-first-week");
    expect(week.trends.current).toEqual(start.trends.next);
  });

  it("tells a Challenging studio about a quiet week instead of ending the game", () => {
    const broke = { ...settleStories(newTestGame({ difficulty: "challenging" })), coins: 10 };
    const week = endDays(broke, 7);
    expect(week.coins).toBeLessThan(0);
    expect(week.story.seen).toContain("is-quiet-week");
  });

  it("pays 30 coins for a shift that takes a whole fresh day", () => {
    const start = settleStories(newTestGame());
    const worked = reduce(start, { type: "workShift" });
    expect(worked.coins).toBe(start.coins + 30);
    expect(worked.calendar.day).toBe(2);
    const tired = { ...start, calendar: { day: 1, hoursLeft: 9 } };
    expect(reduce(tired, { type: "workShift" })).toBe(tired);
  });

  it("adds an hour a day with the Little Blue Van and sells cosmetic loft decor once", () => {
    const rich = { ...settleStories(newTestGame()), coins: 500, reputation: 12 };
    const van = reduce(rich, { type: "buyUpgrade", upgradeId: "little-van" });
    expect(dayLength(van)).toBe(11);
    expect(reduce(van, { type: "endDay" }).calendar.hoursLeft).toBe(11);
    const sign = buyLoftDecor(rich, "neon-sign");
    expect(sign.loftDecor).toEqual(["neon-sign"]);
    expect(buyLoftDecor(sign, "neon-sign")).toBe(sign);
  });
});
