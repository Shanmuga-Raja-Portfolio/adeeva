import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import {
  lastGigId,
  newTestGame,
  playRunTo,
  recipeFor,
  rowStroke,
  settleStories,
  withOrder,
} from "./testPlaythrough";

const NO_RUN_ACTIONS: readonly Action[] = [
  { type: "acceptOffer", offerId: "gig-404" },
  { type: "declineOffer", offerId: "gig-404" },
  { type: "startOrder", gigId: "gig-404" },
  { type: "abandonRun" },
  { type: "goToStage", stage: "paint" },
  { type: "placePiece", pieceId: null, furnitureId: "sofa", col: 0, row: 0, rotation: 0 },
  { type: "rotatePiece", pieceId: "piece-1" },
  { type: "removePiece", pieceId: "piece-1" },
  { type: "tidyUp" },
  { type: "choosePaint", slot: "wall", paintId: "sunflower" },
  { type: "chooseFloor", floorId: "oak-boards" },
  { type: "addLight", lightId: "arc-lamp" },
  { type: "removeLight", index: 0 },
  { type: "buyPlan" },
  { type: "buyDecor", decorId: "round-rug" },
  { type: "edgePath", pathId: "back-ceiling", samples: [[1, 1]] },
  { type: "rollStroke", wall: "back", points: rowStroke(0), durationMs: 500 },
  { type: "reloadRoller" },
  { type: "assistPaint", wall: "back" },
  { type: "layFloor", pieceIndex: 0, candidateKey: "30x30-plain", x: 0, y: 0, assisted: false },
  { type: "placeLight", index: 0, col: 1, row: 1 },
  { type: "liftLight", index: 0 },
  { type: "showMeLight" },
  { type: "addDecor", decorId: "round-rug", x: 100, y: 100 },
  { type: "moveDecor", decorPieceId: "decor-1", x: 1, y: 1, rotation: 0, scale: 1, layer: 1 },
  { type: "removeDecor", decorPieceId: "decor-1" },
  { type: "setSoftColour", colour: "coral" },
  { type: "reveal" },
  { type: "buyUpgrade", upgradeId: "little-van" },
  { type: "buyLoftDecor", decorId: "neon-sign" },
  { type: "markBeatSeen", beatId: "is-nowhere" },
  { type: "setGuide", on: true },
  {
    type: "newGame",
    seed: 1,
    name: " ",
    look: newTestGame().profile.look,
    trait: "dreamer",
    difficulty: "standard",
  },
];

function at(stage: Parameters<typeof playRunTo>[2]): GameState {
  const ordered = withOrder(settleStories(newTestGame()), "nana-pearl");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  return playRunTo(started, recipeFor("nana-pearl"), stage);
}

describe("illegal actions", () => {
  it("return the very same state with no room in progress", () => {
    const state = settleStories(newTestGame());
    for (const action of NO_RUN_ACTIONS) expect(reduce(state, action), action.type).toBe(state);
  });

  it("return the very same state while planning", () => {
    const state = reduce(at("plan"), {
      type: "placePiece",
      pieceId: null,
      furnitureId: "armchair",
      col: 0,
      row: 0,
      rotation: 0,
    });
    const illegal: Action[] = [
      { type: "placePiece", pieceId: null, furnitureId: "bookcase", col: 1, row: 0, rotation: 0 },
      { type: "placePiece", pieceId: null, furnitureId: "toy-box", col: 3, row: 3, rotation: 0 },
      { type: "placePiece", pieceId: null, furnitureId: "sofa", col: 4, row: 0, rotation: 0 },
      { type: "placePiece", pieceId: null, furnitureId: "armchair", col: 1, row: 1, rotation: 0 },
      { type: "placePiece", pieceId: "piece-9", furnitureId: "armchair", col: 2, row: 2, rotation: 0 },
      { type: "placePiece", pieceId: null, furnitureId: "desk", col: 0.5, row: 2, rotation: 0 },
      { type: "goToStage", stage: "shop" },
      { type: "goToStage", stage: "paint" },
      { type: "choosePaint", slot: "feature", paintId: null },
      { type: "removeLight", index: 3 },
      { type: "buyPlan" },
      { type: "startOrder", gigId: lastGigId(state) },
    ];
    for (const action of illegal) expect(reduce(state, action), action.type).toBe(state);
  });

  it("lock the plan once painting starts", () => {
    const painting = reduce(at("paint"), {
      type: "rollStroke",
      wall: "back",
      points: rowStroke(0),
      durationMs: 900,
    });
    const illegal: Action[] = [
      { type: "goToStage", stage: "plan" },
      { type: "goToStage", stage: "shop" },
      { type: "goToStage", stage: "floor" },
      { type: "chooseFloor", floorId: "oak-boards" },
      { type: "layFloor", pieceIndex: 0, candidateKey: "30x30-plain", x: 0, y: 0, assisted: false },
      { type: "addDecor", decorId: "round-rug", x: 10, y: 10 },
    ];
    for (const action of illegal) expect(reduce(painting, action), action.type).toBe(painting);
    expect(reduce(at("paint"), { type: "goToStage", stage: "plan" })).not.toBe(at("paint"));
  });

  it("only place lights where they mount and decor that is in stock, turned in 15 degree steps", () => {
    const lighting = at("light");
    expect(reduce(lighting, { type: "placeLight", index: 0, col: 3, row: 3 })).toBe(lighting);
    expect(reduce(lighting, { type: "placeLight", index: 7, col: 1, row: 1 })).toBe(lighting);
    const styling = at("style");
    expect(reduce(styling, { type: "addDecor", decorId: "round-rug", x: 100, y: 100 })).toBe(styling);
    const stocked = reduce(styling, { type: "buyDecor", decorId: "round-rug" });
    const placed = reduce(stocked, { type: "addDecor", decorId: "round-rug", x: 100, y: 100 });
    const id = placed.activeRun?.decor[0]?.id ?? "";
    const move = {
      type: "moveDecor" as const,
      decorPieceId: id,
      x: 120,
      y: 110,
      rotation: 30,
      scale: 1.5,
      layer: 2,
    };
    expect(reduce(placed, move)).not.toBe(placed);
    expect(reduce(placed, { ...move, rotation: 20 })).toBe(placed);
    expect(reduce(placed, { ...move, scale: 2.5 })).toBe(placed);
    expect(reduce(placed, { ...move, x: 9999 })).toBe(placed);
  });
});
