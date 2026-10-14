import { describe, expect, it } from "vitest";
import { DECOR } from "../content/decor";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { lastGigId, newTestGame, planRoom, recipeFor, settleStories, withOrder } from "./testPlaythrough";
import { EMPTY_CART } from "./stock";
import { cartCost, decorPrice, planShortfall, plannedSpend } from "./warehouse";

function planned(state: GameState): GameState {
  const ordered = withOrder(state, "nana-pearl");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  const atPlan = reduce(started, { type: "goToStage", stage: "plan" });
  return planRoom(atPlan, recipeFor("nana-pearl"));
}

function run(state: GameState) {
  if (state.activeRun === null) throw new Error("no run");
  return state.activeRun;
}

describe("Marigold Warehouse", () => {
  it("prices the plan and takes 1 coin off every item with the Trade Card", () => {
    const state = planned(settleStories(newTestGame()));
    expect(plannedSpend(state, run(state))).toBe(36);
    const card = { ...state, upgrades: ["trade-card" as const] };
    expect(cartCost(card, planShortfall(card, run(card)))).toBe(29);
  });

  it("gives the Trade Card saving on decor too, and never charges more for one basket than for two", () => {
    const card = { upgrades: ["trade-card" as const] };
    const plain = { upgrades: [] };
    for (const item of DECOR) {
      expect(decorPrice(card, item.id)).toBe(item.price - 1);
      expect(decorPrice(plain, item.id)).toBe(item.price);
    }
    const one = cartCost(card, { ...EMPTY_CART, furniture: { bookcase: 1 } });
    const two = cartCost(card, { ...EMPTY_CART, furniture: { bookcase: 2 } });
    expect(two).toBe(one * 2);
    expect(one).toBeLessThan(cartCost(plain, { ...EMPTY_CART, furniture: { bookcase: 1 } }));
  });

  it("uses owned leftovers before buying more", () => {
    const base = settleStories(newTestGame());
    const stocked = {
      ...base,
      stock: { ...base.stock, furniture: { ...base.stock.furniture, armchair: 1 } },
    };
    const state = planned(stocked);
    expect(plannedSpend(state, run(state))).toBe(27);
  });

  it("buys the whole plan in one go only when the coins cover it", () => {
    const state = reduce(planned(settleStories(newTestGame())), { type: "goToStage", stage: "shop" });
    const bought = reduce(state, { type: "buyPlan" });
    expect(bought.coins).toBe(state.coins - 36);
    expect(run(bought).spend).toBe(36);
    expect(reduce(bought, { type: "buyPlan" })).toBe(bought);
    const poor = { ...state, coins: 20 };
    expect(reduce(poor, { type: "buyPlan" })).toBe(poor);
  });
});
