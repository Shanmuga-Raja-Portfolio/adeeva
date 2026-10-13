import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { weighBand } from "./weighAccuracy";
import { GOOD_PLAN, lastGigId, newTestGame, playRunTo, settleStories, withOrder } from "./testPlaythrough";

function atWeigh(): GameState {
  const start = withOrder(settleStories(newTestGame()), "pip");
  const started = reduce(start, { type: "startOrder", gigId: lastGigId(start) });
  return playRunTo(
    started,
    {
      ...GOOD_PLAN,
      productId: "cupcake-tray",
      mixIds: ["vanilla-sponge"],
      fillingId: null,
      colours: ["sky"],
    },
    "weigh",
  );
}

describe("the weigh station", () => {
  it("accepts honest records and refuses impossible ones with the same state", () => {
    const state = atWeigh();
    const ok = reduce(state, {
      type: "recordWeigh",
      batch: 0,
      ingredientId: "flour",
      grams: 205,
      actions: 2,
      assisted: false,
    });
    expect(ok).not.toBe(state);
    const refused = [
      { grams: 601, actions: 1 },
      { grams: 200.5, actions: 1 },
      { grams: -1, actions: 1 },
      { grams: 200, actions: 0 },
      { grams: 200, actions: 41 },
    ].map((record) =>
      reduce(state, { type: "recordWeigh", batch: 0, ingredientId: "flour", assisted: false, ...record }),
    );
    for (const next of refused) expect(next).toBe(state);
    expect(
      reduce(state, {
        type: "recordWeigh",
        batch: 0,
        ingredientId: "butter",
        grams: 180,
        actions: 7,
        assisted: false,
      }),
    ).toBe(state);
    expect(
      reduce(state, {
        type: "recordWeigh",
        batch: 0,
        ingredientId: "cocoa",
        grams: 40,
        actions: 1,
        assisted: false,
      }),
    ).toBe(state);
    expect(
      reduce(state, {
        type: "recordWeigh",
        batch: 3,
        ingredientId: "flour",
        grams: 200,
        actions: 1,
        assisted: false,
      }),
    ).toBe(state);
  });

  it("caps pours at the stock in the pantry", () => {
    const state = atWeigh();
    const short = {
      ...state,
      pantry: { ...state.pantry, ingredients: { ...state.pantry.ingredients, milk: 20 } },
    };
    expect(
      reduce(short, {
        type: "recordWeigh",
        batch: 0,
        ingredientId: "milk",
        grams: 25,
        actions: 1,
        assisted: false,
      }),
    ).toBe(short);
  });

  it("cracks only the eggs the mix needs and commits the poured grams", () => {
    let state = atWeigh();
    const before = state.pantry.ingredients;
    for (const [ingredientId, grams, actions] of [
      ["flour", 210, 1],
      ["caster-sugar", 180, 1],
      ["butter", 175, 7],
      ["milk", 30, 1],
    ] as const)
      state = reduce(state, { type: "recordWeigh", batch: 0, ingredientId, grams, actions, assisted: false });
    expect(reduce(state, { type: "commitBatch", batch: 0 })).toBe(state);
    for (let egg = 0; egg < 3; egg += 1) state = reduce(state, { type: "crackEgg", batch: 0 });
    expect(reduce(state, { type: "crackEgg", batch: 0 })).toBe(state);
    const committed = reduce(state, { type: "commitBatch", batch: 0 });
    expect(committed.pantry.ingredients.flour).toBe(before.flour - 210);
    expect(committed.pantry.ingredients.butter).toBe(before.butter - 175);
    expect(committed.pantry.ingredients.eggs).toBe(before.eggs - 3);
    expect(committed.activeRun?.ingredientValue).toBeCloseTo(
      (210 * 4) / 500 + (180 * 4) / 500 + (175 * 8) / 500 + (30 * 3) / 1000 + 3,
    );
    expect(reduce(committed, { type: "commitBatch", batch: 0 })).toBe(committed);
    expect(
      reduce(committed, {
        type: "recordWeigh",
        batch: 0,
        ingredientId: "flour",
        grams: 200,
        actions: 1,
        assisted: false,
      }),
    ).toBe(committed);
  });

  it("keeps a helped weigh helped when it is kept again untouched", () => {
    const state = atWeigh();
    const helped = reduce(state, {
      type: "recordWeigh",
      batch: 0,
      ingredientId: "flour",
      grams: 200,
      actions: 1,
      assisted: true,
    });
    const again = reduce(helped, {
      type: "recordWeigh",
      batch: 0,
      ingredientId: "flour",
      grams: 200,
      actions: 1,
      assisted: false,
    });
    expect(again.activeRun?.batches[0]?.weighs.flour?.assisted).toBe(true);
    const redone = reduce(helped, {
      type: "recordWeigh",
      batch: 0,
      ingredientId: "flour",
      grams: 200,
      actions: 3,
      assisted: false,
    });
    expect(redone.activeRun?.batches[0]?.weighs.flour?.assisted).toBe(false);
  });

  it("stores the scale's band from the moment the weigh is kept", () => {
    const state = atWeigh();
    const kept = reduce(state, {
      type: "recordWeigh",
      batch: 0,
      ingredientId: "flour",
      grams: 200,
      actions: 1,
      assisted: false,
    });
    expect(kept.activeRun?.batches[0]?.weighs.flour?.band).toBeCloseTo(weighBand(state));
    const brighter = reduce(
      { ...state, upgrades: ["bright-scale"] },
      {
        type: "recordWeigh",
        batch: 0,
        ingredientId: "flour",
        grams: 200,
        actions: 1,
        assisted: false,
      },
    );
    expect(brighter.activeRun?.batches[0]?.weighs.flour?.band).toBeGreaterThan(weighBand(state));
  });
});
