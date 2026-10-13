import { describe, expect, it } from "vitest";
import type { Point } from "../../../engine/geometry/point";
import { placedPolygon } from "../../../engine/geometry/polygonPlacement";
import { polygonsOverlap } from "../../../engine/geometry/polygonOverlap";
import { triangulate } from "../../../engine/geometry/triangulate";
import { GARMENT_PARTS } from "../content/garmentPart";

function areaOf(points: readonly Point[]): number {
  return Math.abs(
    points.reduce((sum, point, index) => {
      const next = points[(index + 1) % points.length] ?? point;
      return sum + point[0] * next[1] - next[0] * point[1];
    }, 0) / 2,
  );
}

function pieceShape(pieceId: string): readonly Point[] {
  const piece = GARMENT_PARTS.flatMap((part) => part.pieces).find((entry) => entry.id === pieceId);
  if (piece === undefined) throw new Error(`missing piece ${pieceId}`);
  return piece.shape;
}

describe("catalog piece overlap", () => {
  it("lets concave catalog pieces nest", () => {
    const front = placedPolygon(pieceShape("fitted-front"), { x: 40, y: 40, rotation: 0 });
    const back = placedPolygon(pieceShape("fitted-back"), { x: 87, y: 21, rotation: 0 });
    expect(polygonsOverlap(front, back)).toBe(false);
    const pushed = placedPolygon(pieceShape("fitted-back"), { x: 80, y: 30, rotation: 0 });
    expect(polygonsOverlap(front, pushed)).toBe(true);
  });

  it("detects overlap between rotated catalog pieces", () => {
    const turnedCorset = placedPolygon(pieceShape("corset-front"), { x: 0, y: 0, rotation: 135 });
    const sitting = placedPolygon(pieceShape("cap-left"), { x: 20, y: 20, rotation: 270 });
    expect(polygonsOverlap(turnedCorset, sitting)).toBe(true);
  });
});

describe("catalog piece triangulation", () => {
  it("covers every catalog piece exactly", () => {
    for (const piece of GARMENT_PARTS.flatMap((part) => part.pieces)) {
      const triangles = triangulate(piece.shape);
      const covered = triangles.reduce((sum, triangle) => sum + areaOf(triangle), 0);
      expect(covered).toBeCloseTo(areaOf(piece.shape), 6);
    }
  });
});
