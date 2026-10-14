import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import {
  BIRDHOUSE_PLAN,
  dispatchAll,
  designActions,
  lastGigId,
  newTestGame,
  runOf,
  settleStories,
  withActiveGig,
} from "./testPlaythrough";
import { boardPrice, planBoards } from "./timberYard";

function atTimber(coins = 100, reputation = 0): GameState {
  const state = withActiveGig({ ...settleStories(newTestGame()), coins, reputation }, "grandpa-teodor");
  return dispatchAll(state, [
    { type: "startCommission", gigId: lastGigId(state) },
    { type: "goToStage", stage: "design" },
    ...designActions(BIRDHOUSE_PLAN),
    { type: "goToStage", stage: "timber" },
  ]);
}

describe("the timber yard", () => {
  it("prices boards by size and rounds them", () => {
    const state = newTestGame();
    expect(boardPrice(state, "pine", "long")).toBe(6);
    expect(boardPrice(state, "pine", "short")).toBe(3);
    expect(boardPrice(state, "pine", "panel")).toBe(10);
    expect(boardPrice(state, "cherry", "panel")).toBe(21);
    expect(boardPrice({ upgrades: ["timber-rack"] }, "walnut", "long")).toBe(18);
  });

  it("knows the typical boards for every plan", () => {
    expect(planBoards("birdhouse")).toEqual({ short: 0, long: 1, panel: 0 });
    expect(planBoards("toy-chest")).toEqual({ short: 0, long: 0, panel: 3 });
    expect(planBoards("window-bench")).toEqual({ short: 0, long: 3, panel: 1 });
  });

  it("charges one hour per trip, however many boards you buy", () => {
    const state = atTimber();
    const first = reduce(state, { type: "buyBoards", sizes: ["long"] });
    expect(first.calendar.hoursLeft).toBe(state.calendar.hoursLeft - 1);
    expect(first.coins).toBe(state.coins - 6);
    const second = reduce(first, { type: "buyBoards", sizes: ["short", "short"] });
    expect(second.calendar.hoursLeft).toBe(first.calendar.hoursLeft);
    expect(second.boards).toHaveLength(3);
    const back = dispatchAll(second, [
      { type: "goToStage", stage: "design" },
      { type: "goToStage", stage: "timber" },
      { type: "buyBoards", sizes: ["long"] },
    ]);
    expect(back.calendar.hoursLeft).toBe(second.calendar.hoursLeft - 1);
  });

  it("buys only what the plan still needs", () => {
    const state = atTimber();
    const bought = reduce(state, { type: "buyPlan" });
    expect(bought.boards.map((board) => board.size)).toEqual(["long"]);
    expect(reduce(bought, { type: "buyPlan" })).toBe(bought);
    expect(runOf(bought).tripPaid).toBe(true);
  });

  it("checks coins for the whole cart at once", () => {
    const state = atTimber(10);
    expect(reduce(state, { type: "buyBoards", sizes: ["long", "long"] })).toBe(state);
    expect(reduce(state, { type: "buyBoards", sizes: [] })).toBe(state);
  });

  it("will not leave the yard without a board of the chosen wood", () => {
    const state = atTimber();
    expect(reduce(state, { type: "goToStage", stage: "layout" })).toBe(state);
  });
});
