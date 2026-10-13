import { describe, expect, it } from "vitest";
import { followAccuracy, recordFollow } from "./followRecord";

const BOUNDS = { units: 3, minTicksPerUnit: 40, maxTicksPerUnit: 1200 };

describe("follow records", () => {
  it("only moves forward within the per-unit tick bounds", () => {
    const first = recordFollow(
      undefined,
      { progress: 1, ticks: 100, insideTicks: 80, assisted: false },
      BOUNDS,
    );
    expect(first).toEqual({ progress: 1, ticks: 100, insideTicks: 80, assisted: false });
    if (first === null) return;
    expect(
      recordFollow(first, { progress: 0.5, ticks: 200, insideTicks: 90, assisted: false }, BOUNDS),
    ).toBeNull();
    expect(
      recordFollow(first, { progress: 2, ticks: 120, insideTicks: 90, assisted: false }, BOUNDS),
    ).toBeNull();
    expect(
      recordFollow(first, { progress: 2, ticks: 1400, insideTicks: 90, assisted: false }, BOUNDS),
    ).toBeNull();
    expect(
      recordFollow(first, { progress: 4, ticks: 900, insideTicks: 90, assisted: false }, BOUNDS),
    ).toBeNull();
    expect(
      recordFollow(first, { progress: 2, ticks: 200, insideTicks: 201, assisted: false }, BOUNDS),
    ).toBeNull();
    const assisted = recordFollow(
      first,
      { progress: 2, ticks: 200, insideTicks: 180, assisted: true },
      BOUNDS,
    );
    expect(assisted?.assisted).toBe(true);
    const later =
      assisted === null
        ? null
        : recordFollow(assisted, { progress: 3, ticks: 300, insideTicks: 280, assisted: false }, BOUNDS);
    expect(later?.assisted).toBe(true);
  });

  it("caps assisted accuracy at 0.8", () => {
    expect(followAccuracy({ progress: 1, ticks: 0, insideTicks: 0, assisted: false })).toBe(0);
    expect(followAccuracy({ progress: 1, ticks: 100, insideTicks: 95, assisted: false })).toBe(0.95);
    expect(followAccuracy({ progress: 1, ticks: 100, insideTicks: 95, assisted: true })).toBe(0.8);
  });
});
