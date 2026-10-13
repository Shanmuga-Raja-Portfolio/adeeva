import { describe, expect, it } from "vitest";
import { runNeeds } from "./bakeNeeds";
import { canGoBack } from "./stageNavigation";
import { canAdvance } from "./stageReadiness";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { slotAssignmentIssue } from "./stack";
import {
  GOOD_PLAN,
  lastGigId,
  newTestGame,
  playRunTo,
  settleStories,
  withOrder,
  type BakePlan,
} from "./testPlaythrough";

const LAYER_PLAN: BakePlan = {
  ...GOOD_PLAN,
  productId: "layer-cake",
  mixIds: ["honey-sponge"],
  fillingId: "honey-cream",
  colours: ["ivory", "rose"],
};

function started(clientId: string): GameState {
  const ordered = withOrder(settleStories(newTestGame({ difficulty: "relaxed" })), clientId);
  return reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
}

describe("designing a bake", () => {
  it("offers only the brief's bakes and checks every choice", () => {
    const design = reduce(started("grandpa-tomasz"), { type: "goToStage", stage: "design" });
    expect(design.activeRun?.stage).toBe("design");
    expect(reduce(design, { type: "chooseProduct", productId: "cupcake-tray" })).toBe(design);
    const cake = reduce(design, { type: "chooseProduct", productId: "layer-cake" });
    expect(cake.activeRun?.design.mixIds).toEqual([null]);
    expect(canAdvance(cake).reasons).toEqual(["Choose a mix.", "Choose a filling.", "Pick an icing colour."]);
    expect(reduce(cake, { type: "chooseMix", batch: 0, mixId: "shortcrust" })).toBe(cake);
    expect(reduce(cake, { type: "chooseFilling", fillingId: null })).toBe(cake);
    let picked = reduce(cake, { type: "chooseMix", batch: 0, mixId: "honey-sponge" });
    picked = reduce(picked, { type: "chooseFilling", fillingId: "honey-cream" });
    for (const colour of ["ivory", "rose", "gold"] as const)
      picked = reduce(picked, { type: "toggleColour", colour });
    expect(reduce(picked, { type: "toggleColour", colour: "sky" })).toBe(picked);
    expect(canAdvance(picked).ok).toBe(true);
  });

  it("puts buttercream, eggs, filling and required toppings on the shopping list", () => {
    const at = playRunTo(started("grandpa-tomasz"), LAYER_PLAN, "pantry");
    const run = at.activeRun;
    if (run === null) throw new Error("no run");
    const needs = runNeeds(run);
    expect(needs.ingredients.butter).toBe(175 + 125);
    expect(needs.ingredients["icing-sugar"]).toBe(250);
    expect(needs.ingredients.honey).toBe(120);
    expect(needs.ingredients.eggs).toBe(3);
    expect(needs.gels).toEqual(["rose"]);
    expect(needs.fillings).toEqual({ "honey-cream": 1 });
    expect(needs.toppings).toEqual({ "sugar-rose": 2 });
    expect(canAdvance(at).ok).toBe(false);
  });

  it("lets the design change until the mix goes in the bowl, and the pantry until the first bake", () => {
    const weigh = playRunTo(started("grandpa-tomasz"), LAYER_PLAN, "weigh");
    expect(canGoBack(weigh, "design").ok).toBe(true);
    expect(canGoBack(weigh, "pantry").ok).toBe(true);
    const mixing = playRunTo(weigh, LAYER_PLAN, "mix");
    expect(canGoBack(mixing, "design").reasons).toEqual(["The mix is in the bowl, so the design is locked."]);
    expect(canGoBack(mixing, "pantry").ok).toBe(true);
    const stacking = playRunTo(mixing, LAYER_PLAN, "stack");
    expect(canGoBack(stacking, "pantry").reasons).toEqual([
      "The first bake is in the oven, so the design is locked.",
    ]);
  });

  it("refuses layers on the wrong spot with a reason, then fills once", () => {
    const stack = playRunTo(started("grandpa-tomasz"), LAYER_PLAN, "stack");
    const run = stack.activeRun;
    if (run === null) throw new Error("no run");
    expect(slotAssignmentIssue(run, "stand", "dome-layer")).toBe(
      "The domed layer belongs on the top of the cake, not the cake stand.",
    );
    expect(slotAssignmentIssue(run, "on-top", "dome-layer")).toBe("Start with the cake stand.");
    expect(reduce(stack, { type: "fill" })).toBe(stack);
    let stacked = reduce(stack, { type: "assignStack", slot: "stand", pieceId: "base-layer" });
    stacked = reduce(stacked, { type: "assignStack", slot: "on-top", pieceId: "dome-layer" });
    const filled = reduce(stacked, { type: "fill" });
    expect(filled.activeRun?.filled).toBe(true);
    expect(filled.pantry.fillings["honey-cream"]).toBe(stacked.pantry.fillings["honey-cream"] - 1);
    expect(reduce(filled, { type: "fill" })).toBe(filled);
    const piping = reduce(filled, { type: "goToStage", stage: "pipe" });
    expect(piping.activeRun?.iced).toBe(true);
    expect(piping.pantry.ingredients["icing-sugar"]).toBe(filled.pantry.ingredients["icing-sugar"] - 250);
    expect(piping.pantry.gels.rose).toBe((filled.pantry.gels.rose ?? 0) - 1);
  });

  it("spends the stage hours as the bake moves along", () => {
    const fresh = started("pip");
    const design = reduce(fresh, { type: "goToStage", stage: "design" });
    expect(design.calendar.hoursLeft).toBe(10);
    const plan: BakePlan = {
      ...GOOD_PLAN,
      productId: "cupcake-tray",
      mixIds: ["vanilla-sponge"],
      fillingId: null,
      colours: ["sky"],
    };
    const review = playRunTo(fresh, plan, "review");
    expect(review.calendar.hoursLeft).toBe(10 - 8 - 1);
  });

  it("charges each step's hours once, even after a trip back to the pantry", () => {
    const plan: BakePlan = {
      ...GOOD_PLAN,
      productId: "cupcake-tray",
      mixIds: ["vanilla-sponge"],
      fillingId: null,
      colours: ["sky"],
    };
    const atBake = playRunTo(started("pip"), plan, "bake");
    const pantry = reduce(atBake, { type: "goToStage", stage: "pantry" });
    expect(pantry.activeRun?.stage).toBe("pantry");
    let back = pantry;
    for (const stage of ["weigh", "mix", "bake"] as const) back = reduce(back, { type: "goToStage", stage });
    expect(back.activeRun?.stage).toBe("bake");
    expect(back.calendar.hoursLeft).toBe(atBake.calendar.hoursLeft);
    const cooled = reduce(playRunTo(back, plan, "bake"), {
      type: "bakeBatch",
      batch: 0,
      heat: 3,
      turnedMinutes: 9,
      takenMinutes: 18,
      assisted: false,
    });
    const stacked = reduce(cooled, { type: "goToStage", stage: "stack" });
    expect(stacked.calendar.hoursLeft).toBe(atBake.calendar.hoursLeft - 2);
  });
});
