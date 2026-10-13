import { describe, expect, it } from "vitest";
import { canWorkShift, weeklyBill } from "./calendar";
import type { GameState } from "./gameState";
import { canBuy, EMPTY_CART } from "./pantry";
import { reduce } from "./reduce";
import { GOOD_PLAN, newTestGame, playTray, settleStories } from "./testPlaythrough";

function onDay(state: GameState, day: number): GameState {
  return { ...state, calendar: { day, hoursLeft: 10 } };
}

describe("the bakery calendar", () => {
  it("charges rent when Counter Day ends, scaled by difficulty", () => {
    expect(weeklyBill(newTestGame({ difficulty: "relaxed" }))).toBe(0);
    expect(weeklyBill(newTestGame({ difficulty: "standard" }))).toBe(70);
    expect(weeklyBill(newTestGame({ difficulty: "challenging" }))).toBe(105);
    const sixth = onDay(settleStories(newTestGame()), 6);
    const counterDay = reduce(sixth, { type: "endDay" });
    expect(counterDay.coins).toBe(sixth.coins);
    expect(counterDay.story.queue).toContain("pa-first-counter");
    const nextWeek = reduce(settleStories(counterDay), { type: "endDay" });
    expect(nextWeek.coins).toBe(sixth.coins - 70);
    expect(nextWeek.trends.current).toEqual(sixth.trends.next);
    expect(nextWeek.story.queue).toContain("pa-first-week");
  });

  it("pays 30 coins for a whole day of tray washing, but not on Counter Day", () => {
    const fresh = settleStories(newTestGame());
    const shifted = reduce(fresh, { type: "workShift" });
    expect(shifted.coins).toBe(fresh.coins + 30);
    expect(shifted.calendar.day).toBe(2);
    expect(canWorkShift(onDay(fresh, 7)).ok).toBe(false);
    const tired = { ...fresh, calendar: { day: 1, hoursLeft: 9 } };
    expect(reduce(tired, { type: "workShift" })).toBe(tired);
  });

  it("rests the oven on Counter Day", () => {
    const counter = onDay(settleStories(newTestGame()), 7);
    expect(reduce(counter, { type: "startTray", productId: "cupcake-tray" })).toBe(counter);
  });

  it("blocks buying when rent pushes coins below zero", () => {
    const broke = { ...settleStories(newTestGame()), coins: -5 };
    const cart = { ...EMPTY_CART, ingredients: { flour: 1 } };
    expect(canBuy(broke, cart).reasons).toEqual(["Work a shift to refill the coin jar."]);
    expect(reduce(broke, { type: "buyPantry", cart })).toBe(broke);
    const challenging = onDay({ ...settleStories(newTestGame({ difficulty: "challenging" })), coins: 20 }, 7);
    const after = reduce(challenging, { type: "endDay" });
    expect(after.coins).toBe(-85);
    expect(after.story.queue).toContain("pa-bankrupt");
  });

  it("buys several packs in one visit for one hour", () => {
    const fresh = settleStories(newTestGame());
    const bought = reduce(fresh, {
      type: "buyPantry",
      cart: {
        ingredients: { flour: 2, cocoa: 1 },
        gels: ["sky"],
        fillings: { "raspberry-jam": 1 },
        toppings: { sprinkles: 2 },
      },
    });
    expect(bought.coins).toBe(fresh.coins - (8 + 8 + 5 + 6 + 6));
    expect(bought.pantry.ingredients.flour).toBe(fresh.pantry.ingredients.flour + 1000);
    expect(bought.pantry.gels.sky).toBe(10);
    expect(bought.calendar.hoursLeft).toBe(9);
    const tooMuch = { ...fresh, coins: 5 };
    expect(reduce(tooMuch, { type: "buyPantry", cart: { ...EMPTY_CART, ingredients: { honey: 1 } } })).toBe(
      tooMuch,
    );
  });

  it("puts a counter tray on the counter and sells it on Counter Day", () => {
    const fresh = settleStories(newTestGame());
    const stocked = playTray(fresh, {
      ...GOOD_PLAN,
      productId: "cupcake-tray",
      mixIds: ["lemon-sponge"],
      fillingId: null,
      colours: ["sky"],
    });
    expect(stocked.counter.trays).toHaveLength(1);
    expect(stocked.counter.trays[0]?.quality).toBeGreaterThan(90);
    expect(stocked.reputation).toBe(fresh.reputation);
    const day7 = settleStories(onDay(stocked, 7));
    const open = reduce(day7, { type: "openCounter" });
    expect(open.counter.session?.cards.length).toBe(6);
  });
});
