import { describe, expect, it } from "vitest";
import { roomById } from "./catalog";
import { doorSwing, pieceShape, placementProblem } from "./floorPlan";

const NOOK = roomById("reading-nook");
const ATTIC = roomById("attic-room");

describe("the floor plan", () => {
  it("turns footprints and their use cells together", () => {
    const flat = pieceShape("single-bed", 0);
    const turned = pieceShape("single-bed", 90);
    expect([flat.width, flat.depth]).toEqual([2, 4]);
    expect([turned.width, turned.depth]).toEqual([4, 2]);
    expect(turned.useCells).toHaveLength(4);
    expect(turned.useCells.every((cell) => cell[1] === 2)).toBe(true);
    expect(pieceShape("desk", 180).useCells.every((cell) => cell[1] === -1)).toBe(true);
  });

  it("keeps the door swing clear", () => {
    expect(doorSwing(NOOK)).toContainEqual([3, 3]);
    const onDoor = { id: "p", furnitureId: "toy-box" as const, col: 3, row: 3, rotation: 0 as const };
    expect(placementProblem(NOOK, [], onDoor)).toBe("door");
  });

  it("keeps tall pieces away from windows, except under a roof window", () => {
    const tall = { id: "p", furnitureId: "bookcase" as const, col: 1, row: 0, rotation: 0 as const };
    expect(placementProblem(NOOK, [], tall)).toBe("window");
    expect(placementProblem(NOOK, [], { ...tall, furnitureId: "window-seat" })).toBeNull();
    expect(placementProblem(ATTIC, [], tall)).toBeNull();
  });

  it("refuses pieces outside the room or on top of each other", () => {
    const chair = { id: "a", furnitureId: "armchair" as const, col: 0, row: 0, rotation: 0 as const };
    expect(placementProblem(NOOK, [], { ...chair, col: 4 })).toBe("outside");
    expect(placementProblem(NOOK, [chair], { ...chair, id: "b", col: 1 })).toBe("overlap");
    expect(placementProblem(NOOK, [chair], { ...chair, col: 1 })).toBeNull();
  });
});
