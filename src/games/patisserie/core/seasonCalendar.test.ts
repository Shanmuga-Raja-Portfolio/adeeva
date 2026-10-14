import { describe, expect, it } from "vitest";
import { canWorkShift, weeklyBill } from "./calendar";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { endDays, readySeason, salonTestGame } from "./salonPlaythrough";
import { dayKind, isFairDay, isSalonDay } from "./seasonCalendar";
import { newTestGame, settleStories } from "./testPlaythrough";

function openedOn(day: number): GameState {
  const base = {
    ...settleStories(newTestGame()),
    calendar: { day, hoursLeft: 10 },
    reputation: 30,
    ordersDelivered: 12,
  };
  return settleStories(reduce(base, { type: "openSalon" }));
}

describe("the salon season calendar", () => {
  it("anchors Salon Day and Fair Day to the season start, in odd and even weeks", () => {
    for (const [day, start] of [
      [10, 15],
      [17, 22],
    ] as const) {
      const opened = openedOn(day);
      expect(opened.fair?.seasonStartDay).toBe(start);
      const ready = readySeason(endDays(opened, start));
      expect(isSalonDay(ready, start + 5)).toBe(true);
      expect(isFairDay(ready, start + 12)).toBe(true);
      expect(dayKind(ready, start + 6)).toBe("counter");
      expect(dayKind(ready, start + 4)).toBe("baking");
      expect(dayKind(ready, start + 13)).toBe("counter");
    }
  });

  it("rests the oven and the café on Salon Day and Fair Day", () => {
    const salonDay = endDays(readySeason(salonTestGame()), 6);
    expect(dayKind(salonDay)).toBe("salon");
    expect(canWorkShift(salonDay).ok).toBe(false);
    expect(reduce(salonDay, { type: "startTray", productId: "cupcake-tray" })).toBe(salonDay);
    const fairDay = endDays(salonDay, 13);
    expect(dayKind(fairDay)).toBe("fair");
    expect(reduce(fairDay, { type: "startShowpiece" })).toBe(fairDay);
  });

  it("keeps the old rent until the season starts, then charges the parlour rent", () => {
    const opened = openedOn(10);
    expect(weeklyBill(opened, 14)).toBe(70);
    expect(weeklyBill(opened, 21)).toBe(100);
    const sunday = endDays(opened, 14);
    const monday = reduce(sunday, { type: "endDay" });
    expect(monday.coins).toBe(sunday.coins - 70);
    const salon = salonTestGame({ difficulty: "challenging" });
    expect(weeklyBill(salon, 7)).toBe(150);
    expect(weeklyBill(salonTestGame({ difficulty: "relaxed" }), 7)).toBe(0);
  });

  it("lets the player rest the parlour at season start for bakery rent and no Salon or Fair Day", () => {
    const salon = salonTestGame();
    const resting = reduce(salon, { type: "restParlour" });
    expect(resting.salon?.parlour).toBe("resting");
    expect(weeklyBill(resting, 7)).toBe(70);
    expect(isSalonDay(resting, 6)).toBe(false);
    expect(isFairDay(resting, 13)).toBe(false);
    expect(reduce(resting, { type: "restParlour" })).toBe(resting);
    const themed = reduce(resting, { type: "chooseFairTheme", themeId: "blossom-lane" });
    expect(themed).toBe(resting);
    const nextSeason = endDays(resting, 15);
    expect(nextSeason.salon?.parlour).toBe("undecided");
    expect(nextSeason.fair?.seasonNumber).toBe(2);
    const opened = readySeason(nextSeason);
    expect(opened.salon?.parlour).toBe("open");
    expect(reduce(opened, { type: "restParlour" })).toBe(opened);
  });

  it("covers the parlour's part of the rent once a season on Standard", () => {
    const broke = { ...readySeason(salonTestGame()), coins: 20 };
    const sunday = endDays(broke, 7);
    const monday = settleStories(reduce({ ...sunday, coins: 20 }, { type: "endDay" }));
    expect(monday.coins).toBe(20 - 70);
    expect(monday.salon?.graceSeason).toBe(1);
    expect(monday.story.seen).toContain("pa-parlour-grace");
    const next = endDays({ ...monday, coins: 20 }, 14);
    const week2 = reduce({ ...next, coins: 20 }, { type: "endDay" });
    expect(week2.coins).toBe(20 - 100);
    const challenging = { ...readySeason(salonTestGame({ difficulty: "challenging" })), coins: 20 };
    const hard = reduce({ ...endDays(challenging, 7), coins: 20 }, { type: "endDay" });
    expect(hard.coins).toBe(20 - 150);
  });

  it("rolls a new season every fourteen days with fresh themes and an empty menu", () => {
    const spring = readySeason(salonTestGame());
    const summer = endDays(spring, 15);
    expect(summer.fair?.seasonNumber).toBe(2);
    expect(summer.fair?.seasonStartDay).toBe(15);
    expect(summer.fair?.themeId).toBeNull();
    expect(summer.salon?.menu).toBeNull();
    expect(reduce(summer, { type: "chooseFairTheme", themeId: "blossom-lane" })).toBe(summer);
    const themed = reduce(summer, { type: "chooseFairTheme", themeId: "seaside-postcard" });
    expect(themed.fair?.themeId).toBe("seaside-postcard");
    expect(themed.pantry.toppings["wafer-fan"]).toBe(summer.pantry.toppings["wafer-fan"] + 2);
    expect(themed.pantry.ingredients.flour).toBe(summer.pantry.ingredients.flour + 500);
    const third = endDays(endDays(summer, 29), 29);
    expect(third.fair?.seasonNumber).toBe(3);
    expect(third.story.seen).toContain("pa-otti-tea");
  });

  it("shows a Trendsetter next season's themes early", () => {
    expect(salonTestGame({ trait: "trendsetter" }).story.seen).toContain("pa-trait-trendsetter-preview");
    expect(salonTestGame({ trait: "dreamer" }).story.seen).not.toContain("pa-trait-trendsetter-preview");
  });
});
