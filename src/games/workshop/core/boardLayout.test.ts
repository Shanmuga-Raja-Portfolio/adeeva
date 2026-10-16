import { describe, expect, it } from "vitest";
import { PRODUCTS } from "../content/product";
import { layoutIssues, placementIssue, showMeSpot } from "./boardLayout";
import { findPart } from "./pieceParts";
import { reduce } from "./reduce";
import {
  BIRDHOUSE_PLAN,
  dispatchAll,
  lastGigId,
  newTestGame,
  playUntil,
  runOf,
  settleStories,
  withActiveGig,
} from "./testPlaythrough";
import type { GameState } from "./gameState";
import type { OwnedBoard } from "./ownedBoard";

function atLayout(): GameState {
  const state = withActiveGig(settleStories(newTestGame()), "grandpa-teodor");
  return playUntil(state, lastGigId(state), BIRDHOUSE_PLAN, "layout");
}

function withKnot(state: GameState): GameState {
  const board = state.boards[0];
  if (board === undefined) throw new Error("No board");
  const knotted: OwnedBoard = { ...board, knots: [{ x: 114, y: 16, r: 3 }] };
  return { ...state, boards: [knotted] };
}

describe("planning the boards", () => {
  it("refuses a part dropped on a knot, off the board or on another part", () => {
    const state = withKnot(atLayout());
    const boardId = state.boards[0]?.id ?? "";
    const run = runOf(state);
    const floor = findPart(run, "floor");
    if (floor === undefined) throw new Error("No floor");
    expect(placementIssue(state, run, floor, { boardId, x: 106, y: 6, rotation: 0 })?.kind).toBe("knot");
    expect(reduce(state, { type: "placePart", partId: "floor", boardId, x: 106, y: 6, rotation: 0 })).toBe(
      state,
    );
    expect(reduce(state, { type: "placePart", partId: "floor", boardId, x: 115, y: 0, rotation: 0 })).toBe(
      state,
    );
    expect(reduce(state, { type: "placePart", partId: "floor", boardId, x: 0, y: 0, rotation: 45 })).toBe(
      state,
    );
    const placed = reduce(state, { type: "placePart", partId: "roof-1", boardId, x: 0, y: 0, rotation: 0 });
    expect(reduce(placed, { type: "placePart", partId: "floor", boardId, x: 4, y: 2, rotation: 0 })).toBe(
      placed,
    );
    const turned = reduce(placed, { type: "placePart", partId: "floor", boardId, x: 30, y: 2, rotation: 90 });
    expect(runOf(turned).placements.floor?.rotation).toBe(90);
  });

  it("lets Show me finish the plan around a knot", () => {
    const state = withKnot(atLayout());
    const parts = runOf(state).design.productId === null ? 0 : 7;
    const done = dispatchAll(
      state,
      Array.from({ length: parts }, () => ({ type: "showMe", partId: null }) as const),
    );
    expect(layoutIssues(done, runOf(done))).toEqual([]);
    expect(Object.values(runOf(done).placements).every((placement) => placement.assisted)).toBe(true);
    expect(showMeSpot(done, runOf(done), null)).toBeNull();
  });

  it("lets Show me find a spot for one chosen part", () => {
    const state = atLayout();
    const placed = reduce(state, { type: "showMe", partId: "floor" });
    expect(runOf(placed).placements.floor?.assisted).toBe(true);
    expect(Object.keys(runOf(placed).placements)).toEqual(["floor"]);
    expect(reduce(placed, { type: "showMe", partId: "floor" })).toBe(placed);
    expect(reduce(placed, { type: "showMe", partId: "ghost" })).toBe(placed);
  });

  it("fits every product's typical boards side by side", () => {
    for (const product of PRODUCTS)
      for (const board of product.canonical)
        for (const spot of board.spots) {
          const part = product.parts.find((entry) => entry.id === spot.partId);
          expect(part, `${product.id} ${spot.partId}`).toBeDefined();
        }
  });

  it("returns a part to the tray", () => {
    const state = atLayout();
    const boardId = state.boards[0]?.id ?? "";
    const placed = reduce(state, { type: "placePart", partId: "roof-1", boardId, x: 0, y: 0, rotation: 0 });
    const removed = reduce(placed, { type: "removePart", partId: "roof-1" });
    expect(runOf(removed).placements["roof-1"]).toBeUndefined();
    expect(reduce(removed, { type: "removePart", partId: "roof-1" })).toBe(removed);
  });

  it("keeps a Show me spot assisted when the part is dropped back on the same spot", () => {
    const state = atLayout();
    const placed = reduce(state, { type: "showMe", partId: "floor" });
    const spot = runOf(placed).placements.floor;
    if (spot === undefined) throw new Error("No spot");
    const redropped = reduce(placed, {
      type: "placePart",
      partId: "floor",
      boardId: spot.boardId,
      x: spot.x,
      y: spot.y,
      rotation: spot.rotation,
    });
    expect(redropped).toBe(placed);
    expect(runOf(redropped).placements.floor?.assisted).toBe(true);
  });
});
