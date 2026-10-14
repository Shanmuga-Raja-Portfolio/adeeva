import { describe, expect, it } from "vitest";
import { roomById } from "./catalog";
import type { PlacedPiece } from "./floorPlan";
import { canMountAt, lightScore, moodMatch, spotLight, sunIcons, type PlacedLight } from "./lighting";

const STUDY = roomById("quiet-study");

function cellHundredths(cell: readonly [number, number], lights: readonly PlacedLight[]): number {
  return spotLight({ pieceId: "probe", cells: [cell] }, lights).hundredths;
}
const DESK: PlacedPiece = { id: "desk", furnitureId: "desk", col: 2, row: 0, rotation: 0 };
const BED: PlacedPiece = { id: "bed", furnitureId: "single-bed", col: 0, row: 0, rotation: 0 };

describe("light", () => {
  it("draws sun icons at the 0.30, 0.60 and 1.00 boundaries", () => {
    expect([29, 30, 59, 60, 99, 100].map(sunIcons)).toEqual([0, 1, 1, 2, 2, 3]);
  });

  it("matches the clip lamp example on a desk", () => {
    const clip: PlacedLight = { lightId: "clip-lamp", col: 2, row: 0 };
    expect(cellHundredths([2, 1], [clip])).toBe(80);
    expect(cellHundredths([3, 1], [clip])).toBe(63);
    expect(
      spotLight(
        {
          pieceId: "desk",
          cells: [
            [2, 1],
            [3, 1],
          ],
        },
        [clip],
      ).lit,
    ).toBe(true);
  });

  it("lights a bed side from a pendant over the middle, but not from one row off", () => {
    const side = {
      pieceId: "bed",
      cells: [
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
      ] as const,
    };
    const over = spotLight(side, [{ lightId: "paper-pendant", col: 2, row: 1 }]);
    expect(over.hundredths).toBe(67);
    expect(over.lit).toBe(true);
    const off = spotLight(side, [{ lightId: "paper-pendant", col: 3, row: 1 }]);
    expect(off.lit).toBe(false);
  });

  it("needs a partner light for string lights", () => {
    expect(cellHundredths([0, 0], [{ lightId: "firefly-string", col: 0, row: 0 }])).toBe(80);
    expect(cellHundredths([1, 1], [{ lightId: "firefly-string", col: 0, row: 0 }])).toBe(42);
  });

  it("counts the share of lights that match the brief's mood", () => {
    const lights: PlacedLight[] = [
      { lightId: "paper-pendant", col: 1, row: 1 },
      { lightId: "clip-lamp", col: 2, row: 0 },
    ];
    expect(moodMatch("warm", lights)).toBe(0.5);
    expect(moodMatch("cool", lights)).toBe(0.5);
    expect(moodMatch("any", lights)).toBe(1);
    expect(lightScore(STUDY, [DESK], lights, "any")).toBe(1);
  });

  it("mounts each light only where it belongs", () => {
    const pieces = [DESK, BED];
    expect(canMountAt(STUDY, pieces, [], "clip-lamp", [2, 0])).toBe(true);
    expect(canMountAt(STUDY, pieces, [], "clip-lamp", [5, 4])).toBe(false);
    expect(canMountAt(STUDY, pieces, [], "brass-sconce", [5, 2])).toBe(true);
    expect(canMountAt(STUDY, pieces, [], "brass-sconce", [3, 3])).toBe(false);
    expect(canMountAt(STUDY, pieces, [], "arc-lamp", [2, 1])).toBe(false);
    expect(canMountAt(STUDY, pieces, [], "arc-lamp", [4, 2])).toBe(true);
    expect(canMountAt(STUDY, pieces, [], "arc-lamp", [4, 4])).toBe(false);
    expect(
      canMountAt(STUDY, pieces, [{ lightId: "paper-pendant", col: 3, row: 3 }], "dome-pendant", [3, 3]),
    ).toBe(false);
  });
});
