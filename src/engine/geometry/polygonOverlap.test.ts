import { describe, expect, it } from "vitest";
import type { Point } from "./point";
import { placedPolygon, polygonBounds, rotatedShape } from "./polygonPlacement";
import { polygonsOverlap } from "./polygonOverlap";
import { triangulate } from "./triangulate";

const square: Point[] = [
  [0, 0],
  [10, 0],
  [10, 10],
  [0, 10],
];

function areaOf(points: readonly Point[]): number {
  return Math.abs(
    points.reduce((sum, point, index) => {
      const next = points[(index + 1) % points.length] ?? point;
      return sum + point[0] * next[1] - next[0] * point[1];
    }, 0) / 2,
  );
}

const ell: Point[] = [
  [0, 0],
  [30, 0],
  [30, 10],
  [10, 10],
  [10, 30],
  [0, 30],
];

describe("polygonsOverlap", () => {
  it("detects overlapping squares", () => {
    const shifted = square.map(([x, y]): Point => [x + 5, y + 5]);
    expect(polygonsOverlap(square, shifted)).toBe(true);
  });

  it("treats touching edges as clear", () => {
    const beside = square.map(([x, y]): Point => [x + 10, y]);
    expect(polygonsOverlap(square, beside)).toBe(false);
    const almost = square.map(([x, y]): Point => [x + 9.995, y]);
    expect(polygonsOverlap(square, almost)).toBe(false);
  });

  it("separates a diamond whose bounding box overlaps but whose shape does not", () => {
    const diamond: Point[] = [
      [15, 8],
      [22, 15],
      [15, 22],
      [8, 15],
    ];
    expect(polygonsOverlap(square, diamond)).toBe(false);
    const closer = diamond.map(([x, y]): Point => [x - 4, y - 4]);
    expect(polygonsOverlap(square, closer)).toBe(true);
  });

  it("lets a box nest in the notch of an L shape", () => {
    const nested: Point[] = [
      [12, 12],
      [28, 12],
      [28, 28],
      [12, 28],
    ];
    expect(polygonsOverlap(ell, nested)).toBe(false);
    expect(polygonsOverlap(nested, ell)).toBe(false);
    const poking = nested.map(([x, y]): Point => [x - 4, y]);
    expect(polygonsOverlap(ell, poking)).toBe(true);
  });

  it("detects overlap between rotated pattern pieces", () => {
    const rect: Point[] = [
      [0, 0],
      [40, 0],
      [40, 10],
      [0, 10],
    ];
    const tilted = placedPolygon(rect, { x: 0, y: 0, rotation: 45 });
    const flat = placedPolygon(rect, { x: 20, y: 10, rotation: 0 });
    expect(polygonsOverlap(tilted, flat)).toBe(true);
    const far = placedPolygon(rect, { x: 0, y: 60, rotation: 0 });
    expect(polygonsOverlap(tilted, far)).toBe(false);
  });
});

describe("triangulate", () => {
  it("covers a square and a concave L exactly", () => {
    for (const shape of [square, ell]) {
      const triangles = triangulate(shape);
      const covered = triangles.reduce((sum, triangle) => sum + areaOf(triangle), 0);
      expect(covered).toBeCloseTo(areaOf(shape), 6);
    }
  });

  it("drops a collinear point without losing area", () => {
    const withMidpoint: Point[] = [
      [0, 0],
      [5, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ];
    const triangles = triangulate(withMidpoint);
    expect(triangles.reduce((sum, triangle) => sum + areaOf(triangle), 0)).toBeCloseTo(100, 6);
  });
});

describe("rotatedShape", () => {
  it("swaps width and height at 90 degrees and keeps the origin at the top left", () => {
    const rect: Point[] = [
      [0, 0],
      [50, 0],
      [50, 40],
      [0, 40],
    ];
    expect(polygonBounds(rotatedShape(rect, 90))).toEqual({ minX: 0, minY: 0, maxX: 40, maxY: 50 });
    expect(polygonBounds(rotatedShape(rect, 180))).toEqual({ minX: 0, minY: 0, maxX: 50, maxY: 40 });
  });

  it("grows the bounding box on the bias", () => {
    const bounds = polygonBounds(rotatedShape(square, 45));
    expect(bounds.maxX).toBeCloseTo(Math.SQRT2 * 10, 5);
  });
});
