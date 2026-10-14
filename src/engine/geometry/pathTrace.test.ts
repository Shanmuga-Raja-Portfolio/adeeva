import { describe, expect, it } from "vitest";
import { isPathTraced, pathCoverage, pathLength, pathTrack, PATH_COVERAGE_SHARE } from "./pathTrace";
import type { Point } from "./point";

const square: readonly Point[] = [
  [0, 0],
  [10, 0],
  [10, 10],
  [0, 10],
];

function walk(points: readonly Point[], closed: boolean, step = 0.25): Point[] {
  const ends = closed ? [...points, points[0] ?? [0, 0]] : points;
  return ends.slice(1).flatMap((end, index) => {
    const start = ends[index] ?? end;
    const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
    const count = Math.ceil(length / step);
    return Array.from({ length: count }, (_, k): Point => [
      start[0] + ((end[0] - start[0]) * k) / count,
      start[1] + ((end[1] - start[1]) * k) / count,
    ]);
  });
}

describe("path tracing", () => {
  it("measures closed loops all the way round and open lines end to end", () => {
    expect(pathLength({ points: square, closed: true })).toBe(40);
    expect(pathLength({ points: square, closed: false })).toBe(30);
    expect(pathTrack({ points: square, closed: false }).segments).toHaveLength(3);
    expect(pathLength({ points: [[1, 1]], closed: false })).toBe(0);
  });

  it("covers a path only where the samples follow it", () => {
    const open = { points: square, closed: false };
    expect(pathCoverage(open, [], 1)).toBe(0);
    expect(pathCoverage(open, walk(square, false), 1)).toBeGreaterThanOrEqual(PATH_COVERAGE_SHARE);
    expect(pathCoverage(open, walk(square.slice(0, 2), false), 1)).toBeLessThan(0.5);
  });

  it("needs both enough samples and enough coverage to count as traced", () => {
    const loop = { points: square, closed: true };
    const full = walk(square, true);
    expect(isPathTraced(loop, full, 1)).toBe(true);
    expect(
      isPathTraced(
        loop,
        full.filter((_, index) => index % 8 === 0),
        1,
      ),
    ).toBe(false);
    expect(isPathTraced(loop, full.slice(0, Math.floor(full.length / 2)), 1)).toBe(false);
  });
});
