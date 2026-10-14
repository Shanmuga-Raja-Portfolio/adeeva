import { describe, expect, it } from "vitest";
import { placedPolygon } from "./polygonPlacement";
import { scaledShape } from "./scaledShape";

describe("scaledShape", () => {
  it("grows or shrinks a shape about its origin before it is placed", () => {
    const square = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ] as const;
    expect(scaledShape(square, 1.2)).toEqual([
      [0, 0],
      [12, 0],
      [12, 12],
      [0, 12],
    ]);
    expect(placedPolygon(scaledShape(square, 0.8), { x: 5, y: 5, rotation: 0 })).toEqual([
      [5, 5],
      [13, 5],
      [13, 13],
      [5, 13],
    ]);
  });
});
