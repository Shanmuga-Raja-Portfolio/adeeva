import { describe, expect, it } from "vitest";
import { trendMatches } from "../../../engine/trendMarket";
import { dishById, isDishId } from "./catalog";
import type { GameState } from "./gameState";
import { restaurantOf, type RestaurantState } from "./path";
import { reduce } from "./reduce";
import { forecastNight, guestsTonight, openNightIssues, seatsTonight } from "./restaurantNight";
import { noteBand, tipsFor } from "./restaurantSettle";
import { nightsWithoutCook } from "./restaurantTeam";
import { unservedCoins } from "./salePlan";
import { crossroadsReady, dispatchAll, must, playWholeService, settleStories } from "./testPlaythrough";
import type { Action } from "./action";

const MENU = ["dal-tadka", "jollof-rice", "kelewele", "spaghetti-al-pomodoro", "elote", "miso-soup"];

function restaurant(state: GameState): RestaurantState {
  const found = restaurantOf(state);
  if (found === null) throw new Error("not a restaurant");
  return found;
}

export function openedRestaurant(difficulty: "relaxed" | "standard" | "challenging" = "standard"): GameState {
  const chosen = settleStories(
    must(crossroadsReady({ difficulty }), { type: "choosePath", path: "restaurant", nameCard: "own-table" }),
  );
  const team: Action[] = [
    { type: "setPathMenu", dishIds: MENU },
    { type: "hireStaff", staffId: "tavi" },
    { type: "hireStaff", staffId: "lin" },
    { type: "hireStaff", staffId: "bruno" },
    ...[2, 3, 4, 5].map((night): Action => ({ type: "toggleShift", staffId: "tavi", night })),
    ...[3, 4, 5, 6].map((night): Action => ({ type: "toggleShift", staffId: "lin", night })),
    ...[2, 3, 4, 5].map((night): Action => ({ type: "toggleShift", staffId: "bruno", night })),
  ];
  return dispatchAll(chosen, team);
}

function nightTwo(difficulty: "relaxed" | "standard" | "challenging" = "standard"): GameState {
  return settleStories(must(openedRestaurant(difficulty), { type: "endDay" }));
}

describe("Your own restaurant", () => {
  it("starts from the Hall menu idea and checks variety, prices and portions", () => {
    const state = openedRestaurant();
    const place = restaurant(state);
    expect(place.menu.map((entry) => entry.dishId)).toEqual(MENU);
    expect(place.menu[0]).toEqual({ dishId: "dal-tadka", price: 5, par: 8 });
    expect(reduce(state, { type: "setPathMenu", dishIds: ["dal-tadka", "jollof-rice", "kelewele"] })).toBe(
      state,
    );
    expect(
      reduce(state, {
        type: "setPathMenu",
        dishIds: ["dal-tadka", "chana-masala", "sambar", "vegetable-biryani"],
      }),
    ).toBe(state);
    expect(reduce(state, { type: "setPrice", dishId: "dal-tadka", price: 2 })).toBe(state);
    expect(reduce(state, { type: "setPrice", dishId: "dal-tadka", price: 11 })).toBe(state);
    const priced = must(state, { type: "setPrice", dishId: "dal-tadka", price: 10 });
    expect(restaurant(priced).menu[0]?.price).toBe(10);
    expect(reduce(state, { type: "setPar", dishId: "dal-tadka", count: 31 })).toBe(state);
    expect(restaurant(must(state, { type: "setPar", dishId: "dal-tadka", count: 30 })).menu[0]?.par).toBe(30);
  });

  it("hires up to four, never more than four nights each, and warns about nights without a cook", () => {
    const state = openedRestaurant();
    expect(reduce(state, { type: "toggleShift", staffId: "tavi", night: 6 })).toBe(state);
    expect(reduce(state, { type: "hireStaff", staffId: "teo" })).toBe(state);
    const four = must(state, { type: "hireStaff", staffId: "ada" });
    expect(reduce(four, { type: "hireStaff", staffId: "yaw" })).toBe(four);
    expect(nightsWithoutCook(restaurant(state))).toEqual([]);
    const parted = must(state, { type: "partWays", staffId: "lin" });
    expect(nightsWithoutCook(restaurant(parted))).toEqual([6]);
  });

  it("is closed on the Market Run and Family Meal, and needs a cook and coins to open", () => {
    const monday = openedRestaurant();
    expect(openNightIssues(monday)).toContain("Today is the Market Run. Plan the week!");
    const tuesday = nightTwo();
    expect(openNightIssues(tuesday)).toEqual([]);
    const noCook = must(tuesday, { type: "toggleShift", staffId: "tavi", night: 2 });
    expect(openNightIssues(noCook)).toContain("Put a cook on tonight's schedule.");
    expect(openNightIssues({ ...tuesday, coins: 3 })[0]).toMatch(/Market Run needs/);
  });

  it("seats 16 plus 6 per cook, holds at 20 without a host, and welcomes 3 more with Bruno", () => {
    const tuesday = nightTwo();
    const place = restaurant(tuesday);
    expect(seatsTonight(tuesday, place, 2)).toBe(22);
    expect(seatsTonight(tuesday, place, 6)).toBe(20);
    const tags = [...new Set(MENU.flatMap((id) => (isDishId(id) ? dishById(id).tags : [])))];
    const hot = trendMatches(tags, tuesday.trends.current).length;
    const wish = Math.round(10 + tuesday.reputation / 5 + tuesday.buzz / 10 + 2 * hot);
    expect(guestsTonight(tuesday, place, 2)).toBe(Math.min(22, wish + 3));
    expect(guestsTonight(tuesday, place, 6)).toBe(Math.min(20, wish));
  });

  it("sells what guests want up to the portions got ready, and the rest is unserved", () => {
    const tuesday = nightTwo();
    const plan = forecastNight(tuesday, restaurant(tuesday), tuesday.calendar.day);
    for (const dish of plan.dishes) {
      expect(dish.sold).toBeLessThanOrEqual(dish.stock);
      expect(dish.leftover).toBe(dish.stock - dish.sold);
    }
    const dear = MENU.reduce<GameState>((state, dishId) => {
      const price = restaurant(state).menu.find((entry) => entry.dishId === dishId)?.price ?? 0;
      return reduce(state, { type: "setPrice", dishId, price: price * 2 });
    }, tuesday);
    const dearPlan = forecastNight(dear, restaurant(dear), dear.calendar.day);
    const sold = (entries: typeof plan.dishes) => entries.reduce((sum, dish) => sum + dish.sold, 0);
    expect(sold(dearPlan.dishes)).toBeLessThan(sold(plan.dishes) / 3);
  });

  it("runs a night as a Service Rush, then pays plates, tips and the team", () => {
    const tuesday = nightTwo();
    const plan = forecastNight(tuesday, restaurant(tuesday), tuesday.calendar.day);
    const open = must(tuesday, { type: "openNight" });
    expect(open.service?.kind).toBe("night");
    expect(open.service?.tickets).toHaveLength(10);
    expect(open.service?.plan.railSize).toBe(4);
    expect(open.coins).toBe(tuesday.coins - plan.ingredients);
    expect(reduce(open, { type: "openNight" })).toBe(open);
    expect(reduce(open, { type: "setPrice", dishId: "dal-tadka", price: 6 })).toBe(open);
    const done = playWholeService(open);
    const report = restaurant(done).lastNight;
    if (report === null) throw new Error("no report");
    expect(report.score).toBeGreaterThanOrEqual(85);
    expect(report.tips).toBe(tipsFor(done, report.score, plan.guests));
    expect(report.teamPay).toBe(30 + 25);
    expect(report.notes).toHaveLength(2);
    const reward = done.log.at(-1);
    expect(reward?.kind).toBe("service");
    const rep = reward?.kind === "service" ? reward.reward.reputation : 0;
    expect(done.coins).toBe(open.coins + report.plateCoins + report.tips - report.teamPay);
    expect(done.reputation).toBe(open.reputation + rep);
    expect(restaurant(done).week.amounts.plates).toBe(report.plateCoins);
    expect(restaurant(done).tonight).toBeNull();
    const gains = reward?.kind === "service" ? reward.mastery : [];
    expect(gains.length).toBeGreaterThan(0);
    expect(gains.length).toBeLessThanOrEqual(2);
  });

  it("chooses guest notes by score and adds the Charmer's warmth to tips", () => {
    expect(noteBand(90)).toBe("glowing");
    expect(noteBand(75)).toBe("happy");
    expect(noteBand(40)).toBe("gentle");
    const state = nightTwo();
    expect(tipsFor(state, 84, 20)).toBe(0);
    expect(tipsFor(state, 90, 20)).toBe(40);
    expect(tipsFor({ ...state, profile: { ...state.profile, trait: "charmer" } }, 90, 20)).toBe(44);
  });

  it("highlights the critic's ticket and writes a kind review", () => {
    const tuesday = nightTwo();
    const place = restaurant(tuesday);
    const visit = place.criticNights[0];
    if (visit === undefined) throw new Error("no critic");
    const critic = settleStories({
      ...tuesday,
      path: { ...place, criticNights: [{ ...visit, day: tuesday.calendar.day }] },
    });
    const open = must(critic, { type: "openNight" });
    expect(open.service?.spotlight).not.toBeNull();
    expect(open.story.queue).toContain("rs-first-critic");
    const done = playWholeService(settleStories(open));
    const review = restaurant(done).lastNight?.review;
    expect(review?.criticId).toBe(visit.criticId);
    expect(review?.spoons).toBeGreaterThanOrEqual(4);
    expect(review?.lines).toHaveLength(3);
    expect(restaurant(done).season.critics).toHaveLength(1);
  });

  it("keeps half the unserved portions with a Walk-in Fridge", () => {
    const tuesday = nightTwo();
    const fridge = { ...tuesday, upgrades: [...tuesday.upgrades, "walk-in-fridge" as const] };
    const full = MENU.reduce<GameState>(
      (state, dishId) => reduce(state, { type: "setPar", dishId, count: 30 }),
      fridge,
    );
    const done = playWholeService(must(full, { type: "openNight" }));
    const report = restaurant(done).lastNight;
    expect(report?.carried.length).toBeGreaterThan(0);
    for (const kept of report?.carried ?? []) {
      const dish = report?.plan.dishes.find((entry) => entry.dishId === kept.dishId);
      expect(kept.count).toBe(Math.floor((dish?.leftover ?? 0) / 2));
    }
    expect(restaurant(done).week.unserved).toBeGreaterThan(0);
    if (report === null || report === undefined) throw new Error("no report");
    expect(restaurant(done).week.unserved).toBe(unservedCoins(report.plan, report.carried));
    expect(restaurant(done).week.unserved).toBeLessThan(unservedCoins(report.plan, []));
  });

  it("sets up kitchen upgrades in the service: warm lamp, second ring and the prep fridge", () => {
    const tuesday = nightTwo();
    const kitted = {
      ...tuesday,
      upgrades: [
        ...tuesday.upgrades,
        "warming-pass" as const,
        "second-ring" as const,
        "prep-fridge" as const,
      ],
    };
    const open = must(kitted, { type: "openNight" });
    expect(open.service?.plan.lampHoldSeconds).toBe(30);
    expect(open.service?.plan.pans).toBe(2);
    const prepped = open.service?.tickets
      .flatMap((ticket) => ticket.dishes)
      .filter((dish) => dish.steps[0]?.by === "staff");
    expect(prepped?.length).toBeGreaterThan(0);
    const plain = must(tuesday, { type: "openNight" });
    expect(plain.service?.plan.lampHoldSeconds).toBe(20);
    expect(plain.service?.plan.pans).toBe(1);
  });

  it("only sells kitchen upgrades to a restaurant, and books them in the week's money", () => {
    const state = openedRestaurant();
    const bought = must(state, { type: "buyUpgrade", upgradeId: "garden-tables" });
    expect(restaurant(bought).week.amounts.upgrades).toBe(180);
    expect(reduce(state, { type: "buyUpgrade", upgradeId: "bigger-room" })).toBe(state);
    const hall = crossroadsReady();
    expect(reduce(hall, { type: "buyUpgrade", upgradeId: "garden-tables" })).toBe(hall);
  });

  it("closes the week with rent on the money card and plays Hollis's money beat", () => {
    let state = openedRestaurant();
    for (let day = 1; day < 7; day += 1) state = settleStories(must(state, { type: "endDay" }));
    const before = state.coins;
    const closed = must(state, { type: "endDay" });
    expect(closed.coins).toBe(before - 300);
    expect(restaurant(closed).lastWeek?.amounts.rent).toBe(300);
    expect(restaurant(closed).week.amounts.rent).toBe(0);
    expect(closed.story.queue).toContain("rs-first-week-money");
  });

  it("lets Hollis fill prices, portions and a team on Relaxed only", () => {
    const standard = openedRestaurant();
    expect(reduce(standard, { type: "askHollis", desk: "menu" })).toBe(standard);
    const chosen = settleStories(
      must(crossroadsReady({ difficulty: "relaxed" }), {
        type: "choosePath",
        path: "restaurant",
        nameCard: "blue-door",
      }),
    );
    const helped = dispatchAll(chosen, [
      { type: "askHollis", desk: "menu" },
      { type: "askHollis", desk: "team" },
      { type: "endDay" },
    ]);
    const ready = settleStories(must(helped, { type: "askHollis", desk: "ready" }));
    expect(restaurant(ready).menu.length).toBeGreaterThanOrEqual(4);
    expect(nightsWithoutCook(restaurant(ready))).toEqual([]);
    expect(restaurant(ready).team.find((row) => row.staffId === "bruno")?.nights).toEqual([2, 3, 4, 5]);
    expect(seatsTonight(ready, restaurant(ready), 2)).toBeGreaterThan(20);
    expect(openNightIssues(ready)).toEqual([]);
    const plan = forecastNight(ready, restaurant(ready), ready.calendar.day);
    for (const dish of plan.dishes) expect(dish.stock).toBe(Math.min(30, dish.wanted));
  });

  it("hands back the same state when Hollis has nothing left to change", () => {
    const chosen = settleStories(
      must(crossroadsReady({ difficulty: "relaxed" }), {
        type: "choosePath",
        path: "restaurant",
        nameCard: "blue-door",
      }),
    );
    const menu = must(chosen, { type: "askHollis", desk: "menu" });
    expect(reduce(menu, { type: "askHollis", desk: "menu" })).toBe(menu);
    const team = must(menu, { type: "askHollis", desk: "team" });
    expect(reduce(team, { type: "askHollis", desk: "team" })).toBe(team);
    const ready = must(team, { type: "askHollis", desk: "ready" });
    expect(reduce(ready, { type: "askHollis", desk: "ready" })).toBe(ready);
  });
});
