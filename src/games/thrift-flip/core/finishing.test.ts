import { describe, expect, it } from "vitest";
import { availableSavedTrims, finishSpend } from "./finishing";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { flipTags, flipColours } from "./flipTags";
import {
  cutActions,
  dispatchAll,
  flipAtUnpick,
  layoutActions,
  newTestGame,
  runOf,
  scrubAll,
  seamActions,
  settleStories,
  unpickAll,
} from "./testPlaythrough";

function atFinish(): GameState {
  const unpicking = flipAtUnpick(
    settleStories(newTestGame()),
    "nana-bea",
    { recipeId: "cushion-cover", parts: {} },
    [{ findId: "faded-jeans", grade: "like-new" }],
  );
  const cleaning = reduce(unpickAll(unpicking, 2), { type: "goToStage", stage: "clean" });
  const laying = reduce(scrubAll(cleaning, 0), { type: "goToStage", stage: "layout" });
  const cutting = dispatchAll(laying, [...layoutActions(laying), { type: "goToStage", stage: "cut" }]);
  const sewing = dispatchAll(cutting, [
    ...cutActions(cutting, "assist"),
    { type: "goToStage", stage: "sew" },
  ]);
  return dispatchAll(sewing, [...seamActions(sewing, 0.9), { type: "goToStage", stage: "finish" }]);
}

describe("finishing touches", () => {
  it("places a saved button for free and a new one for its price", () => {
    const state = atFinish();
    expect(availableSavedTrims(state, "button")).toBe(1);
    const saved = reduce(state, {
      type: "addFinish",
      finish: { kind: "trim", trimId: "button", source: "saved" },
      x: 100,
      y: 100,
    });
    expect(saved.coins).toBe(state.coins);
    expect(availableSavedTrims(saved, "button")).toBe(0);
    const again = {
      type: "addFinish",
      finish: { kind: "trim", trimId: "button", source: "saved" },
      x: 120,
      y: 100,
    } as const;
    expect(reduce(saved, again)).toBe(saved);
    const bought = reduce(saved, {
      type: "addFinish",
      finish: { kind: "trim", trimId: "button", source: "new" },
      x: 140,
      y: 100,
    });
    expect(bought.coins).toBe(state.coins - 1);
    expect(finishSpend(runOf(bought))).toBe(1);
    const removed = reduce(bought, { type: "removeFinish", finishId: "finish-2" });
    expect(removed.coins).toBe(state.coins);
  });

  it("turns a scrap into a patch that carries its colour and feel", () => {
    const state = atFinish();
    const scrap = state.stock.scraps.find((entry) => entry.colour === "ruby");
    if (scrap === undefined) throw new Error("Femi's tin holds a ruby scrap");
    const patched = reduce(state, {
      type: "addFinish",
      finish: { kind: "patch", patchId: "patch-star", scrapId: scrap.id },
      x: 200,
      y: 200,
    });
    expect(flipColours(runOf(patched))).toContain("ruby");
    expect(flipTags(runOf(patched))).toEqual(expect.arrayContaining(["bold", "regal"]));
    const twice = {
      type: "addFinish",
      finish: { kind: "patch", patchId: "patch-heart", scrapId: scrap.id },
      x: 10,
      y: 10,
    } as const;
    expect(reduce(patched, twice)).toBe(patched);
  });

  it("paints dots in a palette colour and refuses an unknown one", () => {
    const state = atFinish();
    const painted = reduce(state, {
      type: "addFinish",
      finish: { kind: "mark", markId: "paint-dots", colour: "teal" },
      x: 50,
      y: 50,
    });
    expect(painted.coins).toBe(state.coins - 2);
    expect(flipColours(runOf(painted))).toContain("teal");
    expect(
      reduce(state, {
        type: "addFinish",
        finish: { kind: "mark", markId: "paint-dots", colour: "black" },
        x: 50,
        y: 50,
      }),
    ).toBe(state);
    expect(
      reduce(state, {
        type: "addFinish",
        finish: { kind: "mark", markId: "mend-cross", colour: "teal" },
        x: 50,
        y: 50,
      }),
    ).toBe(state);
  });

  it("moves, turns in 15 degree steps and scales within limits", () => {
    const state = reduce(atFinish(), {
      type: "addFinish",
      finish: { kind: "mark", markId: "mend-cross", colour: null },
      x: 50,
      y: 50,
    });
    const move = (rotation: number, scale: number, x = 60) =>
      ({ type: "moveFinish", finishId: "finish-1", x, y: 70, rotation, scale, layer: 1 }) as const;
    const moved = reduce(state, move(45, 1.5));
    expect(runOf(moved).finishes[0]).toMatchObject({ x: 60, y: 70, rotation: 45, scale: 1.5 });
    expect(reduce(state, move(40, 1))).toBe(state);
    expect(reduce(state, move(45, 3))).toBe(state);
    expect(reduce(state, move(45, 1, 900))).toBe(state);
    expect(reduce(moved, move(45, 1.5))).toBe(moved);
  });
});
