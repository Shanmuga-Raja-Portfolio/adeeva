import { describe, expect, it } from "vitest";
import type { Point } from "./point";
import { fitSamples, samplesFit } from "./traceSamples";

describe("trace samples", () => {
  it("accepts a finite, non-empty list within the limit", () => {
    expect(samplesFit([[1, 2]], 3)).toBe(true);
    expect(samplesFit([], 3)).toBe(false);
    expect(samplesFit([[0, Number.NaN]], 3)).toBe(false);
    expect(samplesFit([[0, Infinity]], 3)).toBe(false);
    expect(
      samplesFit(
        Array.from({ length: 4 }, (): Point => [0, 0]),
        3,
      ),
    ).toBe(false);
  });

  it("thins a long list under the limit, keeping the last point, and leaves short lists alone", () => {
    const short: Point[] = [
      [0, 0],
      [1, 1],
    ];
    expect(fitSamples(short, 10)).toBe(short);
    const long = Array.from({ length: 101 }, (_, index): Point => [index, 0]);
    const fitted = fitSamples(long, 10);
    expect(fitted.length).toBeLessThanOrEqual(10);
    expect(fitted[0]).toEqual([0, 0]);
    expect(fitted[fitted.length - 1]).toEqual([100, 0]);
    expect(samplesFit(fitted, 10)).toBe(true);
  });
});
