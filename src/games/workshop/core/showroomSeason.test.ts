import { describe, expect, it } from "vitest";
import { rentFor, weeklyBill } from "./calendar";
import { fairEligibleSets } from "./fairPick";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { fairDayOf, isFairDay, isOpenHouseDay, seasonDay } from "./seasonCalendar";
import { playSetToFloor, READING_PLAN, showroomTestGame } from "./setPlaythrough";
import { SHOP_GRACE_COINS } from "./shopGrace";
import { newTestGame, settleStories } from "./testPlaythrough";

function endDaysTo(state: GameState, day: number): GameState {
  let current = state;
  while (current.calendar.day < day) current = settleStories(reduce(current, { type: "endDay" }));
  return current;
}

function openedOn(day: number): GameState {
  const garage = endDaysTo(settleStories(newTestGame()), day);
  const later = { ...garage.story, flags: [...garage.story.flags, "showroom-later"] };
  return settleStories(
    reduce({ ...garage, reputation: 45, delivered: 14, story: later }, { type: "openShowroom" }),
  );
}

describe("the showroom season", () => {
  it("starts on the next week start after opening, in an odd or an even week", () => {
    expect(openedOn(3).showroom?.seasonStartDay).toBe(8);
    expect(openedOn(10).showroom?.seasonStartDay).toBe(15);
    expect(openedOn(7).showroom?.seasonStartDay).toBe(8);
    const showroom = openedOn(10).showroom;
    if (showroom === null) throw new Error("No showroom");
    expect(seasonDay(showroom, 14)).toBeNull();
    expect(seasonDay(showroom, 15)).toBe(1);
    expect(fairDayOf(showroom)).toBe(27);
  });

  it("charges the garage rent until the season starts, then the shop rent", () => {
    const opened = openedOn(3);
    expect(rentFor(opened, 7)).toBe(100);
    expect(rentFor(opened, 14)).toBe(160);
    const coins = opened.coins;
    const weekOne = endDaysTo(opened, 8);
    expect(coins - weekOne.coins).toBe(100);
  });

  it("adds Ren's wage to the weekly bill, and rests both on a resting season", () => {
    const hired = reduce(showroomTestGame(), { type: "takeRenOn" });
    expect(weeklyBill(hired, 7)).toBe(200);
    const rested = reduce(hired, { type: "restShowroom" });
    expect(weeklyBill(rested, 7)).toBe(100);
    expect(reduce(rested, { type: "restShowroom" })).toBe(rested);
    expect(isFairDay({ ...rested, calendar: { day: 13, hoursLeft: 10 } })).toBe(false);
    const nextSeason = endDaysTo(rested, 15);
    expect(nextSeason.showroom?.rested).toBe(false);
    expect(nextSeason.story.seen).not.toContain("ww-fair-skipped");
  });

  it("takes a set made before Season 1 starts to the first Fair, and later sets to the next", () => {
    const made = playSetToFloor({ ...openedOn(10), coins: 600 }, READING_PLAN);
    const early = reduce(made, { type: "markFloorSet", setId: "set-1", mode: "show" });
    const earlySet = early.showroom?.floor[0];
    expect(earlySet?.madeDay).toBeLessThan(15);
    const themed = endDaysTo(early, 15);
    const fairDay = endDaysTo(reduce(themed, { type: "chooseFairTheme", themeId: "orchard-picnic" }), 27);
    expect(fairEligibleSets(fairDay).map((set) => set.setId)).toEqual([earlySet?.setId]);
    const nextSeason = endDaysTo(fairDay, 29);
    expect(fairEligibleSets(nextSeason)).toEqual([]);
    const afterFair = playSetToFloor({ ...nextSeason, coins: 600 }, READING_PLAN);
    expect(fairEligibleSets(afterFair).map((set) => set.setId)).toEqual(["set-2"]);
  });

  it("only rests on season day 1 before a theme is chosen", () => {
    const themed = reduce(showroomTestGame(), { type: "chooseFairTheme", themeId: "kite-festival" });
    expect(reduce(themed, { type: "restShowroom" })).toBe(themed);
    const dayTwo = endDaysTo(showroomTestGame(), 2);
    expect(reduce(dayTwo, { type: "restShowroom" })).toBe(dayTwo);
  });

  it("offers this season's themes only, once", () => {
    const start = showroomTestGame();
    expect(reduce(start, { type: "chooseFairTheme", themeId: "harvest-barn" })).toBe(start);
    const chosen = reduce(start, { type: "chooseFairTheme", themeId: "kite-festival" });
    expect(chosen.showroom?.themeId).toBe("kite-festival");
    expect(reduce(chosen, { type: "chooseFairTheme", themeId: "orchard-picnic" })).toBe(chosen);
    const summer = endDaysTo(chosen, 15);
    expect(summer.showroom?.themeId).toBeNull();
    expect(reduce(summer, { type: "chooseFairTheme", themeId: "seaside-cabin" }).showroom?.themeId).toBe(
      "seaside-cabin",
    );
  });

  it("holds Open House on season days 7 and 14 and keeps Fair Day a working day", () => {
    const start = showroomTestGame();
    expect([6, 7, 13, 14].map((day) => isOpenHouseDay(start, day))).toEqual([false, true, false, true]);
    const fair = endDaysTo(reduce(start, { type: "chooseFairTheme", themeId: "kite-festival" }), 13);
    expect(isFairDay(fair)).toBe(true);
    expect(fair.calendar.hoursLeft).toBe(10);
    expect(reduce(fair, { type: "startSet", templateId: "reading-corner" }).activeRun).not.toBeNull();
  });

  it("moves a commission due on Fair Day to the next day", () => {
    let state = reduce(showroomTestGame({ seed: 4 }), { type: "chooseFairTheme", themeId: "kite-festival" });
    for (let day = 0; day < 13; day += 1) {
      for (const offer of state.gigs.offers) expect(isFairDay(state, offer.brief.deadlineDay)).toBe(false);
      state = settleStories(reduce(state, { type: "endDay" }));
    }
  });

  it("lets Bram cover part of the rent once a season on Standard", () => {
    const broke = { ...reduce(showroomTestGame(), { type: "takeRenOn" }), coins: 50 };
    const settled = endDaysTo(broke, 8);
    expect(settled.coins).toBe(50 - 200 + SHOP_GRACE_COINS);
    expect(settled.story.seen).toContain("ww-tight-season");
    expect(settled.showroom?.graceSeason).toBe(1);
    const again = endDaysTo({ ...settled, coins: 10 }, 15);
    expect(again.coins).toBe(10 - 200);
  });

  it("never lets coins fall at a Relaxed week's end", () => {
    const relaxed = reduce(showroomTestGame({ difficulty: "relaxed" }), { type: "takeRenOn" });
    const later = endDaysTo(relaxed, 15);
    expect(later.coins).toBeGreaterThanOrEqual(relaxed.coins);
  });
});
