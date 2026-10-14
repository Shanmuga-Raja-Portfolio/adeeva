import { describe, expect, it } from "vitest";
import type { Point } from "./point";
import { polygonArea, signedArea } from "./polygonArea";

describe("polygon area", () => {
  const square: readonly Point[] = [
    [0, 0],
    [4, 0],
    [4, 4],
    [0, 4],
  ];

  it("measures the area whichever way the outline winds", () => {
    expect(polygonArea(square)).toBe(16);
    expect(polygonArea([...square].reverse())).toBe(16);
    expect(signedArea(square)).toBe(32);
    expect(signedArea([...square].reverse())).toBe(-32);
  });
});
