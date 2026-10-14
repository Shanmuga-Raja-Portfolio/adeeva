import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import { rentDue } from "./calendar";
import type { GameState } from "./gameState";
import { restaurantOf, type RestaurantState } from "./path";
import { reduce } from "./reduce";
import { forecastNight, openNightIssues } from "./restaurantNight";
import { teamPayFor } from "./restaurantTeam";
import { plateCoins } from "./salePlan";
import { crossroadsReady, dispatchAll, must, playWholeService, settleStories } from "./testPlaythrough";

const MENU = ["dal-tadka", "jollof-rice", "kelewele", "spaghetti-al-pomodoro", "elote", "miso-soup"];

function restaurant(state: GameState): RestaurantState {
  const found = restaurantOf(state);
  if (found === null) throw new Error("not a restaurant");
  return found;
}

function choose(difficulty: "standard" | "challenging", coins: number): GameState {
  const ready = settleStories(
    must(crossroadsReady({ difficulty }, coins), { type: "setMenu", dishIds: MENU }),
  );
  return settleStories(must(ready, { type: "choosePath", path: "restaurant", nameCard: "own-table" }));
}

function endDays(state: GameState, days: number): GameState {
  let current = state;
  for (let day = 0; day < days; day += 1) current = settleStories(must(current, { type: "endDay" }));
  return current;
}

describe("restaurant money never runs into debt", () => {
  it("includes the first Market Run in the start kit, so the door can be opened with exactly enough", () => {
    const chosen = choose("standard", 900);
    expect(chosen.coins).toBe(0);
    const place = restaurant(chosen);
    expect(place.carried).toEqual(place.menu.map((entry) => ({ dishId: entry.dishId, count: entry.par })));
    const tuesday = endDays(
      dispatchAll(chosen, [
        { type: "hireStaff", staffId: "tavi" },
        { type: "toggleShift", staffId: "tavi", night: 2 },
      ]),
      1,
    );
    expect(forecastNight(tuesday, restaurant(tuesday), tuesday.calendar.day).ingredients).toBe(0);
    expect(openNightIssues(tuesday)).toEqual([]);
    const done = playWholeService(must(tuesday, { type: "openNight" }));
    expect(done.coins).toBeGreaterThan(0);
    expect(restaurant(done).carried).toEqual([]);
  });

  it("won't open a night whose plates can't cover tonight's team pay", () => {
    const chosen = choose("standard", 2000);
    const actions: Action[] = [
      { type: "setPathMenu", dishIds: MENU },
      ...MENU.map((dishId): Action => ({ type: "setPar", dishId, count: 0 })),
      { type: "setPar", dishId: "dal-tadka", count: 1 },
      ...["tavi", "lin", "yaw", "nilufar"].flatMap((staffId): Action[] => [
        { type: "hireStaff", staffId },
        { type: "toggleShift", staffId, night: 2 },
      ]),
      { type: "endDay" },
    ];
    const tuesday = settleStories({ ...dispatchAll(chosen, actions), coins: 2 });
    const place = restaurant(tuesday);
    const plan = forecastNight(tuesday, place, tuesday.calendar.day);
    const pay = teamPayFor(place, 2);
    expect(tuesday.coins - plan.ingredients + plateCoins(plan)).toBeLessThan(pay);
    expect(openNightIssues(tuesday)).toContain(
      `Tonight's team pay is ${pay} coins. Put fewer people on tonight or get ready more portions.`,
    );
    expect(reduce(tuesday, { type: "openNight" })).toBe(tuesday);
  });

  it("takes no more rent than the coins on hand, on Standard and Challenging", () => {
    for (const difficulty of ["standard", "challenging"] as const) {
      const chosen = choose(difficulty, 1000);
      expect(rentDue(chosen)).toBe(100);
      const closed = endDays(chosen, 7);
      expect(closed.coins).toBe(0);
      expect(restaurant(closed).lastWeek?.amounts.rent).toBe(100);
      expect(closed.story.queue).not.toContain("ch-bankrupt");
      const broke = endDays({ ...closed, coins: 0 }, 7);
      expect(broke.coins).toBe(0);
    }
  });

  it("climbs back from zero with a pot-wash day and a small Market Run", () => {
    const chosen = choose("standard", 900);
    const staffed = dispatchAll(chosen, [
      { type: "setPathMenu", dishIds: MENU },
      { type: "hireStaff", staffId: "tavi" },
      ...[2, 3, 4, 5].map((night): Action => ({ type: "toggleShift", staffId: "tavi", night })),
    ]);
    const washed = settleStories(must(staffed, { type: "potWash" }));
    expect(washed.coins).toBe(30);
    const small = MENU.reduce<GameState>(
      (state, dishId) => reduce(state, { type: "setPar", dishId, count: 1 }),
      washed,
    );
    expect(openNightIssues(small)).toEqual([]);
    const done = playWholeService(must(small, { type: "openNight" }));
    expect(done.coins).toBeGreaterThan(washed.coins);
  });
});
