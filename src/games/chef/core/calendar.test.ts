import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { weeklyBill } from "./calendar";
import { cookDish, must, newTestGame, settleStories } from "./testPlaythrough";

function untilDay(state: GameState, day: number): GameState {
  let next = state;
  while (next.calendar.day < day) next = settleStories(reduce(next, { type: "endDay" }));
  return next;
}

describe("calendar, rent and the pot sink", () => {
  it("charges board on day seven, scaled by difficulty", () => {
    expect(weeklyBill(settleStories(newTestGame()))).toBe(40);
    expect(weeklyBill(settleStories(newTestGame({ difficulty: "relaxed" })))).toBe(0);
    expect(weeklyBill(settleStories(newTestGame({ difficulty: "challenging" })))).toBe(60);
    expect(weeklyBill(settleStories(newTestGame({ start: "head" })))).toBe(150);
    const week = untilDay(settleStories(newTestGame()), 7);
    expect(week.board.lesson).toBeNull();
    const after = settleStories(reduce(week, { type: "endDay" }));
    expect(after.coins).toBe(week.coins - 40);
    expect(after.calendar).toEqual({ day: 8, hoursLeft: 10 });
    expect(after.story.seen).toContain("ch-first-week");
  });

  it("pays a whole untouched day of pot-washing, and only a whole day", () => {
    const state = settleStories(newTestGame());
    const washed = must(state, { type: "potWash" });
    expect(washed.coins).toBe(state.coins + 30);
    expect(washed.calendar.day).toBe(2);
    const busy = must(state, { type: "startPractice", dishId: "jollof-rice" });
    expect(reduce(busy, { type: "potWash" })).toBe(busy);
  });

  it("queues the coin-jar talk on Challenging when coins dip below zero", () => {
    const poor = { ...untilDay(settleStories(newTestGame({ difficulty: "challenging" })), 7), coins: 10 };
    const after = reduce(poor, { type: "endDay" });
    expect(after.coins).toBe(-50);
    expect(after.story.queue).toContain("ch-bankrupt");
  });

  it("sells tools once, gated by reputation and coins", () => {
    const state = settleStories(newTestGame());
    expect(reduce(state, { type: "buyUpgrade", upgradeId: "knife-roll" })).toBe(state);
    const known = { ...state, reputation: 5 };
    const bought = must(known, { type: "buyUpgrade", upgradeId: "knife-roll" });
    expect(bought.coins).toBe(0);
    expect(bought.upgrades).toEqual(["knife-roll"]);
    expect(reduce(bought, { type: "buyUpgrade", upgradeId: "knife-roll" })).toBe(bought);
  });

  it("keeps an unfinished test day for that day only", () => {
    const ready = {
      ...settleStories(newTestGame()),
      mentorsMet: ["indian", "italian", "japanese", "mexican", "french", "west-african"] as const,
      reputation: 20,
    };
    const started = must(ready, {
      type: "startTest",
      test: "graduation",
      dishIds: ["dal-tadka", "jollof-rice", "miso-soup"],
    });
    const one = cookDish(settleStories(started));
    expect(one.testDay?.qualities).toHaveLength(1);
    const next = settleStories(reduce(one, { type: "endDay" }));
    expect(next.testDay).toBeNull();
    expect(next.rung).toBe("student");
  });
});
