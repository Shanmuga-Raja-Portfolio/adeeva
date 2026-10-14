import { describe, expect, it } from "vitest";
import { findSuitsBrief, RAIL_SIZE, rollRail, unlockedFinds } from "./marketRail";
import { reduce } from "./reduce";
import { buyIssues } from "./market";
import { dispatchAll, newTestGame, runOf, settleStories, withActiveGig } from "./testPlaythrough";
import type { GameState } from "./gameState";

function atMarket(seed = 7): GameState {
  const base = withActiveGig(settleStories(newTestGame({ seed })), "nana-bea");
  return dispatchAll(base, [
    { type: "startFlip", gigId: base.gigs.active[0]?.id ?? "" },
    { type: "goToStage", stage: "design" },
    { type: "chooseRecipe", recipeId: "cushion-cover" },
    { type: "goToStage", stage: "market" },
  ]);
}

describe("the market rail", () => {
  it("shows six distinct unlocked finds with conditions and whole-coin prices", () => {
    for (let seed = 1; seed < 30; seed += 1) {
      const state = newTestGame({ seed });
      expect(state.rail).toHaveLength(RAIL_SIZE);
      expect(new Set(state.rail.map((slot) => slot.findId)).size).toBe(RAIL_SIZE);
      const pool = unlockedFinds(state).map((find) => find.id);
      for (const slot of state.rail) {
        expect(pool).toContain(slot.findId);
        expect(Number.isInteger(slot.price)).toBe(true);
      }
    }
  });

  it("always holds a fitting find for every open brief", () => {
    for (let seed = 1; seed < 60; seed += 1) {
      const state = rollRail(withActiveGig(withActiveGig(newTestGame({ seed }), "kofi"), "lumi"));
      const briefs = [...state.gigs.offers, ...state.gigs.active].map((entry) => entry.brief);
      for (const brief of briefs)
        expect(state.rail.some((slot) => findSuitsBrief(slot.findId, brief))).toBe(true);
    }
  });

  it("keeps a find on the rail that every open brief can really use, avoided cloth included", () => {
    for (let seed = 1; seed <= 8; seed += 1) {
      let state: GameState = { ...settleStories(newTestGame({ seed })), reputation: 20 };
      for (let day = 0; day < 40; day += 1) {
        state = reduce(state, { type: "endDay" });
        const briefs = [...state.gigs.offers, ...state.gigs.active].map((entry) => entry.brief);
        for (const brief of briefs)
          expect(state.rail.some((slot) => findSuitsBrief(slot.findId, brief))).toBe(true);
      }
    }
  });

  it("buys several finds at once, all or nothing, after a one-hour visit", () => {
    const state = atMarket();
    expect(reduce(state, { type: "buyFinds", slotIds: [state.rail[0]?.id ?? ""] })).toBe(state);
    const open = reduce(state, { type: "openMarket" });
    expect(open.calendar.hoursLeft).toBe(state.calendar.hoursLeft - 1);
    expect(reduce(open, { type: "openMarket" })).toBe(open);
    const [first, second] = open.rail;
    if (first === undefined || second === undefined) throw new Error("Rail is empty");
    const poor = { ...open, coins: first.price + second.price - 1 };
    expect(buyIssues(poor, [first.id, second.id])).toHaveLength(1);
    expect(reduce(poor, { type: "buyFinds", slotIds: [first.id, second.id] })).toBe(poor);
    const bought = reduce(open, { type: "buyFinds", slotIds: [first.id, second.id] });
    expect(bought.coins).toBe(open.coins - first.price - second.price);
    expect(bought.stock.finds).toHaveLength(2);
    expect(bought.rail.filter((slot) => slot.sold)).toHaveLength(2);
    expect(reduce(bought, { type: "buyFinds", slotIds: [first.id] })).toBe(bought);
    expect(runOf(bought).finds.length).toBeGreaterThan(0);
  });

  it("unlocks pricier finds with reputation", () => {
    const stall = newTestGame();
    expect(unlockedFinds({ ...stall, reputation: 0 }).map((find) => find.id)).not.toContain("wool-blazer");
    expect(unlockedFinds({ ...stall, reputation: 9 }).map((find) => find.id)).toContain("wool-blazer");
    expect(unlockedFinds({ ...stall, reputation: 18 })).toHaveLength(14);
    expect(unlockedFinds({ ...stall, reputation: 60 })).toHaveLength(14);
  });
});
