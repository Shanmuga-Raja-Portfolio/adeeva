import { describe, expect, it } from "vitest";
import type { DifficultyId } from "../../../engine/difficulty";
import type { GameState } from "./gameState";
import { canWorkShift, dayHours, weeklyBill } from "./calendar";
import { reduce } from "./reduce";
import { dispatchAll, newTestGame, settleStories, withActiveGig } from "./testPlaythrough";

function onDay(difficulty: DifficultyId, day: number, coins = 100): GameState {
  const state = settleStories(newTestGame({ difficulty }));
  return { ...state, coins, calendar: { day, hoursLeft: 10 } };
}

describe("the calendar", () => {
  it("charges rent at the end of every 7th day by difficulty", () => {
    expect(weeklyBill(onDay("relaxed", 7))).toBe(0);
    expect(weeklyBill(onDay("standard", 7))).toBe(100);
    expect(weeklyBill(onDay("challenging", 7))).toBe(150);
    const paid = reduce(onDay("standard", 7, 300), { type: "endDay" });
    expect(paid.coins).toBe(200);
    expect(paid.calendar).toEqual({ day: 8, hoursLeft: 10 });
    expect(paid.story.queue).toContain("ww-first-week");
    expect(reduce(onDay("standard", 6, 300), { type: "endDay" }).coins).toBe(300);
  });

  it("moves next week's favourites up when the week turns", () => {
    const state = onDay("standard", 7, 300);
    const turned = reduce(state, { type: "endDay" });
    expect(turned.trends.current).toEqual(state.trends.next);
  });

  it("tells trendsetters about the favourites when the first week ends", () => {
    const state = settleStories(newTestGame({ trait: "trendsetter" }));
    const turned = reduce({ ...state, calendar: { day: 7, hoursLeft: 10 } }, { type: "endDay" });
    expect(turned.story.queue).toContain("ww-trendsetter");
  });

  it("shows A Lean Week when Challenging rent leaves the tin empty", () => {
    const broke = reduce(onDay("challenging", 7, 40), { type: "endDay" });
    expect(broke.coins).toBe(-110);
    expect(broke.story.queue).toContain("ww-lean-week");
    expect(reduce(onDay("standard", 7, 40), { type: "endDay" }).story.queue).not.toContain("ww-lean-week");
  });

  it("pays 30 for a whole untouched day at Pell's yard", () => {
    const state = onDay("standard", 2);
    expect(canWorkShift(state).ok).toBe(true);
    const worked = reduce(state, { type: "workShift" });
    expect(worked.coins).toBe(130);
    expect(worked.calendar.day).toBe(3);
    const tired = { ...state, calendar: { day: 2, hoursLeft: 9 } };
    expect(reduce(tired, { type: "workShift" })).toBe(tired);
  });

  it("adds an hour every day once the skylight is in", () => {
    const state = { ...onDay("standard", 2, 500), reputation: 12 };
    const bought = reduce(state, { type: "buyUpgrade", upgradeId: "skylight" });
    expect(bought.coins).toBe(280);
    expect(dayHours(bought)).toBe(11);
    expect(reduce(bought, { type: "endDay" }).calendar.hoursLeft).toBe(11);
    expect(bought.calendar.hoursLeft).toBe(11);
    expect(reduce(onDay("standard", 2, 500), { type: "buyUpgrade", upgradeId: "skylight" })).toEqual(
      onDay("standard", 2, 500),
    );
  });

  it("still allows a whole-day shift after buying the skylight first thing in the morning", () => {
    const morning = { ...onDay("standard", 2, 500), reputation: 12 };
    const bought = reduce(morning, { type: "buyUpgrade", upgradeId: "skylight" });
    expect(canWorkShift(bought).ok).toBe(true);
    const worked = reduce(bought, { type: "workShift" });
    expect(worked).not.toBe(bought);
    expect(worked.calendar).toEqual({ day: 3, hoursLeft: 11 });
    const afternoon = { ...morning, calendar: { day: 2, hoursLeft: 6 } };
    const late = reduce(afternoon, { type: "buyUpgrade", upgradeId: "skylight" });
    expect(late.calendar.hoursLeft).toBe(7);
    expect(reduce(late, { type: "workShift" })).toBe(late);
  });

  it("lets a commission lapse well after its deadline on Standard", () => {
    const state = withActiveGig(onDay("standard", 2), "grandpa-teodor");
    const deadline = state.gigs.active[0]?.brief.deadlineDay ?? 0;
    const late = { ...state, calendar: { day: deadline + 3, hoursLeft: 10 }, reputation: 5 };
    const lapsed = dispatchAll(late, [{ type: "endDay" }]);
    expect(lapsed.gigs.active).toHaveLength(0);
    expect(lapsed.gigs.lapsed).toHaveLength(1);
    expect(lapsed.reputation).toBe(4);
  });

  it("buys garage decor once, with paint for the door", () => {
    const state = onDay("standard", 2, 500);
    const painted = reduce(state, { type: "buyDecor", decorId: "door-paint", paint: "teal" });
    expect(painted.decor).toEqual([{ id: "door-paint", paint: "teal" }]);
    expect(painted.coins).toBe(420);
    expect(reduce(painted, { type: "buyDecor", decorId: "door-paint", paint: "sky" })).toBe(painted);
    expect(reduce(state, { type: "buyDecor", decorId: "door-paint", paint: null })).toBe(state);
    expect(reduce(state, { type: "buyDecor", decorId: "bench-lamp", paint: "sky" })).toBe(state);
  });
});
