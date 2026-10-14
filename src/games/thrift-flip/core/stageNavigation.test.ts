import { describe, expect, it } from "vitest";
import { buyIssues } from "./market";
import { reduce } from "./reduce";
import { runStageHours } from "./stageReadiness";
import {
  dispatchAll,
  flipAtUnpick,
  newTestGame,
  runOf,
  scrubAll,
  settleStories,
  unpickAll,
  withActiveGig,
  withFind,
} from "./testPlaythrough";

function atLayout() {
  const unpicking = flipAtUnpick(
    settleStories(newTestGame()),
    "nana-bea",
    { recipeId: "cushion-cover", parts: {} },
    [{ findId: "linen-curtain", grade: "like-new" }],
  );
  const cleaning = reduce(unpickAll(unpicking, 2), { type: "goToStage", stage: "clean" });
  return reduce(scrubAll(cleaning, 0), { type: "goToStage", stage: "layout" });
}

describe("moving between flip steps", () => {
  it("charges each step's hours only the first time it is finished", () => {
    const layout = atLayout();
    expect(runOf(layout).stage).toBe("layout");
    const revisited = dispatchAll(layout, [
      { type: "goToStage", stage: "market" },
      { type: "goToStage", stage: "unpick" },
      { type: "goToStage", stage: "clean" },
      { type: "goToStage", stage: "layout" },
    ]);
    expect(runOf(revisited).stage).toBe("layout");
    expect(revisited.calendar.hoursLeft).toBe(layout.calendar.hoursLeft);
    const atUnpick = dispatchAll(layout, [
      { type: "goToStage", stage: "market" },
      { type: "goToStage", stage: "unpick" },
    ]);
    expect(runStageHours(runOf(atUnpick))).toBe(0);
  });

  it("charges the workbench hours again when a new find joins the flip", () => {
    const layout = atLayout();
    const stocked = withFind(reduce(layout, { type: "goToStage", stage: "market" }), "faded-jeans");
    const extra = stocked.stock.finds[stocked.stock.finds.length - 1]?.id ?? "";
    const first = runOf(stocked).finds[0]?.id ?? "";
    const swapped = reduce(stocked, { type: "chooseFinds", findIds: [first, extra] });
    expect(runOf(swapped).reachedStage).toBe("market");
    const unpicking = reduce(swapped, { type: "goToStage", stage: "unpick" });
    expect(runStageHours(runOf(unpicking))).toBe(1);
  });

  it("closes the rail when going back to the plan, so nothing is bought there", () => {
    const base = withActiveGig(settleStories(newTestGame()), "nana-bea");
    const back = dispatchAll(base, [
      { type: "startFlip", gigId: base.gigs.active[0]?.id ?? "" },
      { type: "goToStage", stage: "design" },
      { type: "chooseRecipe", recipeId: "cushion-cover" },
      { type: "goToStage", stage: "market" },
      { type: "openMarket" },
      { type: "goToStage", stage: "design" },
    ]);
    expect(runOf(back).stage).toBe("design");
    expect(back.calendar.marketOpen).toBe(false);
    const slot = back.rail.find((entry) => entry.price <= back.coins);
    if (slot === undefined) throw new Error("No affordable find");
    const forced = { ...back, calendar: { ...back.calendar, marketOpen: true } };
    expect(buyIssues(forced, [slot.id]).length).toBeGreaterThan(0);
    expect(reduce(forced, { type: "buyFinds", slotIds: [slot.id] })).toBe(forced);
  });
});
