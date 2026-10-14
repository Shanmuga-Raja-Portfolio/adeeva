import { describe, expect, it } from "vitest";
import { roomById } from "./catalog";
import type { PlacedPiece } from "./floorPlan";
import { walkThrough } from "./walkThrough";

const NOOK = roomById("reading-nook");
const STUDY = roomById("quiet-study");

function piece(
  id: string,
  furnitureId: PlacedPiece["furnitureId"],
  col: number,
  row: number,
  rotation: PlacedPiece["rotation"] = 0,
): PlacedPiece {
  return { id, furnitureId, col, row, rotation };
}

describe("walk-through space", () => {
  it("counts an empty room as fully reachable and roomy", () => {
    const walk = walkThrough(NOOK, [], 1);
    expect(walk.reach).toBe(1);
    expect(walk.roomy).toBe(1);
    expect(walk.flow).toBe(1);
  });

  it("scores a use spot that faces a wall as blocked", () => {
    const facingWall = piece("a", "armchair", 0, 0, 180);
    const walk = walkThrough(NOOK, [facingWall], 1);
    expect(walk.reach).toBe(0);
    expect(walk.footprints).toHaveLength(0);
  });

  it("scores a use spot behind other furniture as unreachable", () => {
    const desk = piece("desk", "desk", 0, 0);
    const wardrobe = piece("wardrobe", "wardrobe", 0, 2, 0);
    const sideBlock = piece("box", "toy-box", 2, 1, 90);
    const walk = walkThrough(STUDY, [desk, wardrobe, sideBlock], 1);
    const deskSpots = walk.footprints.filter((print) => print.pieceId === "desk");
    expect(deskSpots.every((print) => !print.reached)).toBe(true);
    expect(walk.reach).toBeLessThan(1);
  });

  it("lets a desk chair tuck into the desk without blocking the spot", () => {
    const desk = piece("desk", "desk", 0, 0);
    const chair = piece("chair", "desk-chair", 0, 1);
    const walk = walkThrough(STUDY, [desk, chair], 1);
    expect(walk.reach).toBe(1);
  });

  it("asks a coffee table only for one reachable neighbour", () => {
    const table = piece("table", "coffee-table", 1, 1);
    expect(walkThrough(NOOK, [table], 1).reach).toBe(1);
  });

  it("aims for more free floor on harder difficulties", () => {
    const pieces = [
      piece("a", "armchair", 0, 0),
      piece("b", "bookcase", 3, 0),
      piece("c", "toy-box", 0, 2, 90),
      piece("d", "window-seat", 2, 0, 90),
    ];
    const relaxed = walkThrough(NOOK, pieces, 1.3).roomy;
    const standard = walkThrough(NOOK, pieces, 1).roomy;
    const challenging = walkThrough(NOOK, pieces, 0.85).roomy;
    expect(relaxed).toBeGreaterThanOrEqual(standard);
    expect(standard).toBeGreaterThan(challenging);
  });
});
