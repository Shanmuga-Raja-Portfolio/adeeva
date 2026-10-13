import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { GOOD_PLAN, lastGigId, newTestGame, playRunTo, settleStories, withOrder } from "./testPlaythrough";

const NO_RUN_ACTIONS: readonly Action[] = [
  { type: "acceptOffer", offerId: "gig-404" },
  { type: "declineOffer", offerId: "gig-404" },
  { type: "startOrder", gigId: "gig-404" },
  { type: "abandonRun" },
  { type: "goToStage", stage: "pipe" },
  { type: "chooseProduct", productId: "layer-cake" },
  { type: "chooseMix", batch: 0, mixId: "cocoa-sponge" },
  { type: "toggleColour", colour: "sky" },
  { type: "choosePattern", pattern: "b" },
  { type: "recordWeigh", batch: 0, ingredientId: "flour", grams: 200, actions: 1, assisted: false },
  { type: "crackEgg", batch: 0 },
  { type: "commitBatch", batch: 0 },
  { type: "recordStir", batch: 0, progress: 1, ticks: 100, insideTicks: 50, assisted: false },
  { type: "bakeBatch", batch: 0, heat: 3, turnedMinutes: 12, takenMinutes: 24, assisted: false },
  { type: "assignStack", slot: "stand", pieceId: "base-layer" },
  { type: "fill" },
  {
    type: "pipePath",
    pathId: "swirl-1",
    samples: [
      [1, 1],
      [2, 2],
    ],
    assisted: false,
  },
  { type: "addTopping", toppingId: "sprinkles", x: 100, y: 100 },
  { type: "moveTopping", toppingId: "topping-1", x: 1, y: 1, rotation: 0, scale: 1, layer: 1 },
  { type: "removeTopping", toppingId: "topping-1" },
  { type: "deliver" },
  { type: "openCounter" },
  { type: "sellBox", cardIndex: 0, trayIds: [] },
  { type: "closeCounter" },
  { type: "buyUpgrade", upgradeId: "piping-set" },
  { type: "buyPantry", cart: { ingredients: {}, gels: [], fillings: {}, toppings: {} } },
  { type: "markBeatSeen", beatId: "pa-nowhere" },
  { type: "setGuide", on: false },
  {
    type: "newGame",
    seed: 1,
    name: " ",
    look: newTestGame().profile.look,
    trait: "dreamer",
    difficulty: "standard",
  },
];

function midDecorate(): GameState {
  const ordered = withOrder(settleStories(newTestGame()), "pip");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  return playRunTo(
    started,
    {
      ...GOOD_PLAN,
      productId: "cupcake-tray",
      mixIds: ["vanilla-sponge"],
      fillingId: null,
      colours: ["sky"],
    },
    "decorate",
  );
}

describe("illegal actions", () => {
  it("return the very same state with no bake on the bench", () => {
    const state = settleStories(newTestGame());
    for (const action of NO_RUN_ACTIONS) expect(reduce(state, action), action.type).toBe(state);
  });

  it("return the very same state mid-bake", () => {
    const state = midDecorate();
    const illegal: Action[] = [
      { type: "goToStage", stage: "design" },
      { type: "goToStage", stage: "weigh" },
      { type: "goToStage", stage: "done" },
      { type: "chooseProduct", productId: "layer-cake" },
      { type: "startTray", productId: "cupcake-tray" },
      { type: "addTopping", toppingId: "sprinkles", x: 500, y: 100 },
      { type: "addTopping", toppingId: "gold-star", x: 100, y: 100 },
      { type: "deliver" },
      { type: "workShift" },
    ];
    for (const action of illegal) expect(reduce(state, action), action.type).toBe(state);
  });

  it("moves toppings only in 15 degree turns within the cake", () => {
    const state = reduce(midDecorate(), { type: "addTopping", toppingId: "sprinkles", x: 200, y: 200 });
    const placed = state.activeRun?.toppings[0];
    if (placed === undefined) throw new Error("no topping");
    const move = {
      type: "moveTopping" as const,
      toppingId: placed.id,
      x: 210,
      y: 190,
      rotation: 30,
      scale: 1.5,
      layer: 2,
    };
    expect(reduce(state, move)).not.toBe(state);
    expect(reduce(state, { ...move, rotation: 20 })).toBe(state);
    expect(reduce(state, { ...move, scale: 2.5 })).toBe(state);
    expect(reduce(state, { ...move, x: 401 })).toBe(state);
    const removed = reduce(state, { type: "removeTopping", toppingId: placed.id });
    expect(removed.activeRun?.toppings).toEqual([]);
  });
});
