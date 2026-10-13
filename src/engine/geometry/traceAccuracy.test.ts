import { describe, expect, it } from "vitest";
import type { Point } from "./point";
import { distanceToOutline, traceAccuracy } from "./traceAccuracy";

const L: Point[] = [
  [0, 0],
  [10, 0],
  [10, 10],
];

describe("trace accuracy", () => {
  it("joins the last point to the first only for closed outlines", () => {
    expect(distanceToOutline([5, 5], L)).toBeCloseTo(0);
    expect(distanceToOutline([5, 5], L, false)).toBeCloseTo(5);
    const diagonal: Point[] = [
      [2, 2],
      [4, 4],
      [6, 6],
    ];
    expect(traceAccuracy(diagonal, L, 0.5)).toBe(1);
    expect(traceAccuracy(diagonal, L, 0.5, false)).toBe(0);
    expect(traceAccuracy([], L, 0.5)).toBe(0);
  });
});
