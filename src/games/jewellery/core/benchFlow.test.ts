import { describe, expect, it } from "vitest";
import { canGoBack } from "./stageNavigation";
import { canBuySupplies, EMPTY_CART, shortfall } from "./supplies";
import type { GameState } from "./gameState";
import { placementIssue } from "./sheetPlan";
import { reduce } from "./reduce";
import {
  GOOD_PLAN,
  lastGigId,
  newTestGame,
  playRunTo,
  playStall,
  settleStories,
  withOrder,
} from "./testPlaythrough";

function started(clientId = "gran-mina"): GameState {
  const ordered = withOrder(settleStories(newTestGame()), clientId);
  return reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
}

describe("the bench flow", () => {
  it("costs one hour to leave design and one hour per supply visit", () => {
    const atSupplies = playRunTo(started(), GOOD_PLAN, "supplies");
    expect(atSupplies.calendar.hoursLeft).toBe(9);
    const run = atSupplies.activeRun;
    if (run === null) throw new Error("no run");
    const first = reduce(atSupplies, { type: "buySupplies", cart: { ...EMPTY_CART, stones: { garnet: 1 } } });
    expect(first.calendar.hoursLeft).toBe(8);
    expect(first.coins).toBe(atSupplies.coins - 6);
    const second = reduce(first, {
      type: "buySupplies",
      cart: { ...EMPTY_CART, extras: { "fine-chain": 1 } },
    });
    expect(second.calendar.hoursLeft).toBe(8);
    expect(shortfall(second, run).metal).toEqual([{ metalId: "brass", size: "sheet", count: 1 }]);
  });

  it("checks coins atomically", () => {
    const atSupplies = { ...playRunTo(started(), GOOD_PLAN, "supplies"), coins: 9 };
    const cart = { ...EMPTY_CART, stones: { garnet: 1 }, extras: { "fine-chain": 1 as const } };
    expect(canBuySupplies(atSupplies, cart).ok).toBe(false);
    expect(reduce(atSupplies, { type: "buySupplies", cart })).toBe(atSupplies);
  });

  it("keeps parts on the sheet and apart from each other", () => {
    const atPlan = playRunTo(started(), GOOD_PLAN, "plan");
    const run = atPlan.activeRun;
    if (run === null) throw new Error("no run");
    expect(placementIssue(atPlan, run, "plate", { size: "sheet", x: 30, y: 2, rotation: 0 })).toBe(
      "It needs its own space on the sheet.",
    );
    const placed = reduce(atPlan, {
      type: "placePart",
      partKey: "plate",
      size: "sheet",
      x: 2,
      y: 2,
      rotation: 0,
    });
    const overlap = {
      type: "placePart" as const,
      partKey: "seat",
      size: "sheet" as const,
      x: 8,
      y: 8,
      rotation: 0 as const,
    };
    expect(reduce(placed, overlap)).toBe(placed);
    expect(reduce(placed, { ...overlap, x: 27 })).not.toBe(placed);
    expect(
      reduce(placed, { type: "placePart", partKey: "loop", size: "strip", x: 1, y: 1, rotation: 0 }),
    ).toBe(placed);
    const shown = reduce(placed, { type: "showMePlan" });
    expect(Object.keys(shown.activeRun?.plan ?? {})).toHaveLength(3);
  });

  it("lets design, supplies and plan be revisited only until the first cut", () => {
    const atCut = playRunTo(started(), GOOD_PLAN, "cut");
    expect(canGoBack(atCut, "design").ok).toBe(true);
    const back = reduce(atCut, { type: "goToStage", stage: "plan" });
    expect(back.activeRun?.stage).toBe("plan");
    const forward = reduce(back, { type: "goToStage", stage: "cut" });
    expect(forward.calendar.hoursLeft).toBe(back.calendar.hoursLeft);
    const atJoin = playRunTo(atCut, GOOD_PLAN, "join");
    expect(canGoBack(atJoin, "design").ok).toBe(false);
    expect(reduce(atJoin, { type: "goToStage", stage: "design" })).toBe(atJoin);
  });

  it("clears the plan when the design changes", () => {
    const atPlan = reduce(playRunTo(started(), GOOD_PLAN, "plan"), { type: "showMePlan" });
    const back = reduce(atPlan, { type: "goToStage", stage: "design" });
    const changed = reduce(back, { type: "chooseOption", slot: "shape", optionId: "star" });
    expect(changed.activeRun?.plan).toEqual({});
  });

  it("makes a stall piece in four hours and keeps at most six in the box", () => {
    const state = settleStories(newTestGame());
    const plan = { ...GOOD_PLAN, metalId: "copper" as const, stoneId: null };
    const made = playStall(state, "stack-ring", plan);
    expect(made.stallBox).toHaveLength(1);
    const first = made.stallBox[0];
    if (first === undefined) throw new Error("no stall piece");
    expect(first.quality).toBeGreaterThan(80);
    expect(state.calendar.hoursLeft - made.calendar.hoursLeft).toBe(5);
    const full = {
      ...made,
      activeRun: null,
      stallBox: Array.from({ length: 6 }, (_, index) => ({ ...first, id: `piece-${index}` })),
    };
    expect(reduce(full, { type: "startStall", productId: "stack-ring" })).toBe(full);
  });
});
