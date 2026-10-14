import { describe, expect, it } from "vitest";
import { ACCENT_IDS, BAND_IDS, SHAPE_IDS } from "../content/partOption";
import { PRODUCTS } from "../content/product";
import { STONE_CUTS } from "../content/stone";
import { designCutPaths, partOutline } from "./partGeometry";
import { pointInPolygon, polishMask } from "./polish";
import { accentOutlines, mirroredShape, seatOutline, shapeOutline } from "./shapeOutline";

describe("shape outlines", () => {
  it("carry the corner dots the design asks for", () => {
    const dots = Object.fromEntries(SHAPE_IDS.map((shape) => [shape, shapeOutline(shape).dots.length]));
    expect(dots).toEqual({ circle: 0, heart: 1, leaf: 0, raindrop: 1, crescent: 2, star: 10 });
    expect(seatOutline("teardrop").dots).toHaveLength(1);
    expect(seatOutline("round").dots).toHaveLength(0);
  });

  it("stay inside the unit box", () => {
    for (const shape of SHAPE_IDS)
      for (const [x, y] of shapeOutline(shape).points) {
        expect(x).toBeGreaterThanOrEqual(-1e-9);
        expect(x).toBeLessThanOrEqual(1 + 1e-9);
        expect(y).toBeGreaterThanOrEqual(-1e-9);
        expect(y).toBeLessThanOrEqual(1 + 1e-9);
      }
  });

  it("put every accent window inside its shape", () => {
    for (const shape of SHAPE_IDS)
      for (const accent of ACCENT_IDS)
        for (const window of accentOutlines(accent, shape))
          for (const point of window.points)
            expect(pointInPolygon(point, shapeOutline(shape).points), `${accent} in ${shape}`).toBe(true);
  });

  it("mirror a shape and keep its dots on the mirrored corners", () => {
    const heart = shapeOutline("heart");
    const mirrored = mirroredShape(heart);
    const dot = heart.points[heart.dots[0] ?? 0];
    const mirroredDot = mirrored.points[mirrored.dots[0] ?? 0];
    expect(mirroredDot?.[0]).toBeCloseTo(1 - (dot?.[0] ?? 0));
    expect(mirroredDot?.[1]).toBeCloseTo(dot?.[1] ?? 0);
  });

  it("give every part between 12 and 36 live polish cells", () => {
    for (const product of PRODUCTS)
      for (const shape of SHAPE_IDS)
        for (const band of BAND_IDS)
          for (const cut of STONE_CUTS)
            for (const part of product.parts) {
              const outline = partOutline(part, { options: { shape, band, accent: "dot-row" }, cut });
              const live = polishMask(outline, part.width, part.height).filter(Boolean).length;
              expect(live, `${product.id} ${part.key} ${shape} ${cut}`).toBeGreaterThanOrEqual(12);
              expect(live).toBeLessThanOrEqual(36);
            }
  });

  it("adds accent windows as separate closed cuts on a shape pendant", () => {
    const paths = designCutPaths({
      productId: "shape-pendant",
      options: { shape: "star", accent: "dot-row" },
      metalId: "silver",
      stoneId: null,
    });
    expect(paths.map((path) => path.id)).toEqual([
      "plate",
      "plate-accent-1",
      "plate-accent-2",
      "plate-accent-3",
      "loop",
    ]);
    expect(paths[0]?.dots).toHaveLength(10);
  });
});
