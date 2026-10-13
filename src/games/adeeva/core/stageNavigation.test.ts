import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { canAdvance } from "./stageReadiness";
import { canGoBack } from "./stageNavigation";
import { dispatchAll, newTestGame, SIMPLE_DESIGN, withActiveGig } from "./testPlaythrough";

function sketching(): GameState {
  const base = withActiveGig(newTestGame(), "mom");
  const gig = base.gigs.active[0];
  if (gig === undefined) throw new Error("expected a gig");
  return dispatchAll(base, [
    { type: "startRun", gigId: gig.id },
    { type: "goToStage", stage: "sketch" },
  ]);
}

const designActions: Action[] = Object.entries(SIMPLE_DESIGN).flatMap(([category, partId]): Action[] => [
  { type: "chooseSketchPart", category: category as keyof typeof SIMPLE_DESIGN, partId },
  { type: "chooseSketchFabric", category: category as keyof typeof SIMPLE_DESIGN, fabricId: "ivory-cotton" },
]);

describe("stage navigation", () => {
  it("only moves forward when the stage is complete", () => {
    const state = sketching();
    expect(state.activeRun?.stage).toBe("sketch");
    expect(canAdvance(state).reasons).toContain("Choose a bodice.");
    expect(reduce(state, { type: "goToStage", stage: "fabric" })).toBe(state);
    const designed = dispatchAll(state, designActions);
    expect(canAdvance(designed).ok).toBe(true);
    expect(reduce(designed, { type: "goToStage", stage: "cut" })).toBe(designed);
    const fabric = reduce(designed, { type: "goToStage", stage: "fabric" });
    expect(fabric.activeRun?.stage).toBe("fabric");
    expect(fabric.calendar.hoursLeft).toBe(9);
  });

  it("rejects stage completion and shop visits without enough hours", () => {
    const designed = dispatchAll(sketching(), designActions);
    const exhausted: GameState = { ...designed, calendar: { ...designed.calendar, hoursLeft: 0 } };
    const check = canAdvance(exhausted);
    expect(check.ok).toBe(false);
    expect(check.reasons[0]).toContain("End the day");
    expect(reduce(exhausted, { type: "goToStage", stage: "fabric" })).toBe(exhausted);
    expect(reduce(exhausted, { type: "openShop" })).toBe(exhausted);
    const nextDay = reduce(exhausted, { type: "endDay" });
    expect(reduce(nextDay, { type: "goToStage", stage: "fabric" }).activeRun?.stage).toBe("fabric");
  });

  it("allows going back to sketch before any cut", () => {
    const fabric = reduce(dispatchAll(sketching(), designActions), { type: "goToStage", stage: "fabric" });
    expect(canGoBack(fabric, "sketch").ok).toBe(true);
    const back = reduce(fabric, { type: "goToStage", stage: "sketch" });
    expect(back.activeRun?.stage).toBe("sketch");
    expect(back.calendar.hoursLeft).toBe(fabric.calendar.hoursLeft);
    expect(reduce(fabric, { type: "goToStage", stage: "brief" })).toBe(fabric);
  });

  it("requires owned fabric before cutting", () => {
    const fabric = reduce(dispatchAll(sketching(), designActions), { type: "goToStage", stage: "fabric" });
    expect(canAdvance(fabric).reasons).toEqual(["Buy some Ivory Cotton Poplin at the shop."]);
    const stocked = dispatchAll(fabric, [
      { type: "openShop" },
      { type: "buyFabric", fabricId: "ivory-cotton", metres: 0.75 },
      { type: "buyFabric", fabricId: "ivory-cotton", metres: 1.5 },
    ]);
    expect(stocked.inventory.fabricMetres["ivory-cotton"]).toBe(1.5);
    expect(stocked.coins).toBe(fabric.coins - 27);
    expect(stocked.calendar.hoursLeft).toBe(fabric.calendar.hoursLeft - 1);
    expect(reduce(stocked, { type: "openShop" })).toBe(stocked);
    expect(reduce(stocked, { type: "goToStage", stage: "cut" }).activeRun?.stage).toBe("cut");
  });

  it("blocks locked fabrics and purchases outside the shop", () => {
    const state = sketching();
    expect(reduce(state, { type: "chooseSketchFabric", category: "skirt", fabricId: "gold-satin" })).toBe(
      state,
    );
    expect(reduce(state, { type: "buyFabric", fabricId: "ivory-cotton", metres: 1 })).toBe(state);
    const open = reduce(state, { type: "openShop" });
    expect(reduce(open, { type: "buyFabric", fabricId: "gold-satin", metres: 1 })).toBe(open);
    expect(reduce(open, { type: "buyFabric", fabricId: "ivory-cotton", metres: 50 })).toBe(open);
  });
});
