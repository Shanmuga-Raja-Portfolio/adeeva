import { describe, expect, it } from "vitest";
import { paletteCohesion } from "./paletteCohesion";

describe("paletteCohesion", () => {
  it("averages the shared share of every pair of palettes", () => {
    expect(
      paletteCohesion([
        ["sky", "navy"],
        ["sky", "navy"],
      ]),
    ).toBe(1);
    expect(paletteCohesion([["sky"], ["coral"]])).toBe(0);
    expect(paletteCohesion([["sky", "silver"], ["sky"], ["silver"]])).toBeCloseTo((0.5 + 0.5 + 0) / 3);
    expect(paletteCohesion([["sky"]])).toBe(0);
  });
});
