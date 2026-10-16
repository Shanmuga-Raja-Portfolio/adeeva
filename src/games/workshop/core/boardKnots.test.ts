import { describe, expect, it } from "vitest";
import { polygonsOverlap } from "../../../engine/geometry/polygonOverlap";
import { BOARD_SIZE_IDS } from "../content/boardSize";
import { PRODUCT_IDS } from "../content/product";
import { WOOD_IDS } from "../content/wood";
import { boardKnots, canonicalRects, knotPolygon, MAX_KNOT_RADIUS, MIN_KNOT_RADIUS } from "./boardKnots";
import { boardSizeById, woodById } from "./catalog";
import { productShape } from "./testPlaythrough";

describe("board knots", () => {
  it("never block a product's typical layout, on any wood, size or board", () => {
    for (const productId of PRODUCT_IDS)
      for (const size of BOARD_SIZE_IDS) {
        const rects = canonicalRects(productShape(productId), size);
        for (const woodId of WOOD_IDS)
          for (let number = 1; number <= 60; number += 1)
            for (const knot of boardKnots(number, woodId, size, rects))
              for (const rect of rects) {
                const box: [number, number][] = [
                  [rect.x, rect.y],
                  [rect.x + rect.width, rect.y],
                  [rect.x + rect.width, rect.y + rect.height],
                  [rect.x, rect.y + rect.height],
                ];
                expect(polygonsOverlap(knotPolygon(knot), box)).toBe(false);
              }
      }
  });

  it("rolls 1 to 3 knots on knotty woods and at most 1 elsewhere, inside the board", () => {
    const counts = new Set<number>();
    for (let number = 1; number <= 80; number += 1) {
      const knotty = boardKnots(number, "pine", "long", []);
      counts.add(knotty.length);
      expect(knotty.length).toBeGreaterThanOrEqual(1);
      expect(knotty.length).toBeLessThanOrEqual(3);
      expect(boardKnots(number, "oak", "long", []).length).toBeLessThanOrEqual(1);
      for (const knot of knotty) {
        expect(knot.r).toBeGreaterThanOrEqual(MIN_KNOT_RADIUS);
        expect(knot.r).toBeLessThanOrEqual(MAX_KNOT_RADIUS);
        expect(knot.x - knot.r).toBeGreaterThanOrEqual(0);
        expect(knot.x + knot.r).toBeLessThanOrEqual(boardSizeById("long").width);
      }
    }
    expect([...counts].sort()).toEqual([1, 2, 3]);
    expect(woodById("pine").knotty).toBe(true);
  });

  it("is the same every time for the same board", () => {
    expect(boardKnots(7, "cedar", "panel", [])).toEqual(boardKnots(7, "cedar", "panel", []));
  });
});
