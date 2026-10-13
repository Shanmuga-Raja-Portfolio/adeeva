import { describe, expect, it } from "vitest";
import { canCommitCut } from "./cutCommit";
import { piecePlacementIssues } from "./piecePlacementIssues";
import { cutMetres, metresForLength } from "./cutMetres";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import {
  dispatchAll,
  layoutAndCut,
  newTestGame,
  SIMPLE_LAYOUT,
  sketchAndShop,
  withActiveGig,
} from "./testPlaythrough";

function atCuttingTable(): GameState {
  const base = withActiveGig(newTestGame(), "mom");
  const gig = base.gigs.active[0];
  if (gig === undefined) throw new Error("expected a gig");
  return sketchAndShop(reduce(base, { type: "startRun", gigId: gig.id }));
}

const allAccurate = Object.fromEntries(Object.keys(SIMPLE_LAYOUT).map((id) => [id, 0.9]));

describe("cut metres", () => {
  it("rounds the layout length up to half metres", () => {
    expect(metresForLength(0.1)).toBe(0.5);
    expect(metresForLength(50)).toBe(0.5);
    expect(metresForLength(50.5)).toBe(1);
    expect(metresForLength(110)).toBe(1.5);
  });
});

describe("commitCut", () => {
  it("deducts the fabric exactly once and ignores a second commit", () => {
    const table = atCuttingTable();
    expect(table.inventory.fabricMetres["ivory-cotton"]).toBe(2);
    const cut = layoutAndCut(table);
    const run = cut.activeRun;
    expect(run?.cutFabrics).toEqual(["ivory-cotton"]);
    expect(cut.inventory.fabricMetres["ivory-cotton"]).toBe(0.5);
    expect(run?.fabricSpend).toBe(27);
    expect(run?.cutAccuracy["a-line-front"]).toBe(0.9);
    const again = reduce(cut, { type: "commitCut", fabricId: "ivory-cotton", accuracies: allAccurate });
    expect(again).toBe(cut);
  });

  it("measures the layout from the lowest placed piece", () => {
    const placed = dispatchAll(
      atCuttingTable(),
      Object.entries(SIMPLE_LAYOUT).map(([pieceId, spot]) => ({
        type: "placePiece" as const,
        pieceId,
        ...spot,
      })),
    );
    const run = placed.activeRun;
    if (run === null) throw new Error("expected a run");
    expect(cutMetres(run, "ivory-cotton")).toBe(1.5);
  });

  it("rejects a layout that needs more fabric than you own", () => {
    const table = atCuttingTable();
    const short: GameState = {
      ...table,
      inventory: { ...table.inventory, fabricMetres: { "ivory-cotton": 1 } },
    };
    const placed = dispatchAll(
      short,
      Object.entries(SIMPLE_LAYOUT).map(([pieceId, spot]) => ({
        type: "placePiece" as const,
        pieceId,
        ...spot,
      })),
    );
    const check = canCommitCut(placed, "ivory-cotton");
    expect(check.ok).toBe(false);
    expect(check.reasons.some((reason) => reason.includes("1.5 m"))).toBe(true);
    expect(reduce(placed, { type: "commitCut", fabricId: "ivory-cotton", accuracies: allAccurate })).toBe(
      placed,
    );
  });

  it("rejects a commit with missing or invalid accuracies", () => {
    const placed = dispatchAll(
      atCuttingTable(),
      Object.entries(SIMPLE_LAYOUT).map(([pieceId, spot]) => ({
        type: "placePiece" as const,
        pieceId,
        ...spot,
      })),
    );
    const missing = { ...allAccurate, "peter-pan": Number.NaN };
    expect(reduce(placed, { type: "commitCut", fabricId: "ivory-cotton", accuracies: missing })).toBe(placed);
    const tooHigh = { ...allAccurate, "peter-pan": 1.5 };
    expect(reduce(placed, { type: "commitCut", fabricId: "ivory-cotton", accuracies: tooHigh })).toBe(placed);
  });

  it("locks the layout and the design once cut", () => {
    const cut = layoutAndCut(atCuttingTable());
    expect(reduce(cut, { type: "placePiece", pieceId: "peter-pan", x: 0, y: 150, rotation: 0 })).toBe(cut);
    expect(reduce(cut, { type: "rotatePiece", pieceId: "peter-pan", rotation: 90 })).toBe(cut);
    expect(reduce(cut, { type: "removePiece", pieceId: "peter-pan" })).toBe(cut);
    expect(reduce(cut, { type: "goToStage", stage: "sketch" })).toBe(cut);
  });
});

describe("cutting table regressions", () => {
  it("commits a layout that ends within the shared tolerance of the bolt", () => {
    const layout = { ...SIMPLE_LAYOUT, "a-line-front": { x: 0, y: 130.005, rotation: 0 as const } };
    const placed = dispatchAll(
      atCuttingTable(),
      Object.entries(layout).map(([pieceId, spot]) => ({ type: "placePiece" as const, pieceId, ...spot })),
    );
    const run = placed.activeRun;
    if (run === null) throw new Error("expected a run");
    expect(piecePlacementIssues(run, placed.inventory)).toEqual([]);
    expect(cutMetres(run, "ivory-cotton")).toBe(2);
    expect(canCommitCut(placed, "ivory-cotton").ok).toBe(true);
    const cut = reduce(placed, { type: "commitCut", fabricId: "ivory-cotton", accuracies: allAccurate });
    expect(cut.inventory.fabricMetres["ivory-cotton"]).toBe(0);
  });

  it("ignores inherited object keys used as piece ids", () => {
    const table = atCuttingTable();
    expect(reduce(table, { type: "removePiece", pieceId: "constructor" })).toBe(table);
    expect(reduce(table, { type: "rotatePiece", pieceId: "constructor", rotation: 90 })).toBe(table);
    expect(reduce(table, { type: "placePiece", pieceId: "toString", x: 0, y: 0, rotation: 0 })).toBe(table);
  });

  it("returns the same state when a piece is dropped where it already lies", () => {
    const placed = reduce(atCuttingTable(), {
      type: "placePiece",
      pieceId: "peter-pan",
      x: 100,
      y: 70,
      rotation: 0,
    });
    expect(reduce(placed, { type: "placePiece", pieceId: "peter-pan", x: 100, y: 70, rotation: 0 })).toBe(
      placed,
    );
  });
});
