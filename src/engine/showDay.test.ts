import { describe, expect, it } from "vitest";
import { GENTLE_SHOW_SETBACKS, showDemand, showReputation } from "./showDay";

const TERMS = { floor: 50, step: 5, baseValue: 30, valuePerSeason: 8, seasonCap: 5 };

describe("showReputation", () => {
  it("rewards a show at or above the floor the same way for every difficulty", () => {
    expect(showReputation(50, "challenging")).toBe(2);
    expect(showReputation(100, "relaxed")).toBe(10);
  });

  it("uses the gentle setbacks below the floor by default", () => {
    expect(showReputation(49, "relaxed")).toBe(GENTLE_SHOW_SETBACKS.relaxed);
    expect(showReputation(49, "standard")).toBe(0);
    expect(showReputation(49, "challenging")).toBe(-1);
  });

  it("takes a game's own setbacks below the floor", () => {
    const setbacks = { relaxed: 0, standard: -1, challenging: -2 };
    expect(showReputation(10, "standard", setbacks)).toBe(-1);
    expect(showReputation(10, "challenging", setbacks)).toBe(-2);
    expect(showReputation(80, "challenging", setbacks)).toBe(7);
  });
});

describe("showDemand", () => {
  it("brings nothing at or below the floor", () => {
    expect(showDemand(40, 1, TERMS)).toEqual({ count: 0, coins: 0 });
  });

  it("counts one more per step above the floor", () => {
    expect(showDemand(70, 1, TERMS)).toEqual({ count: 4, coins: 120 });
  });

  it("pays more each season up to the cap", () => {
    expect(showDemand(70, 2, TERMS).coins).toBe(4 * 38);
    expect(showDemand(70, 5, TERMS).coins).toBe(4 * 62);
    expect(showDemand(70, 9, TERMS).coins).toBe(4 * 62);
  });
});
