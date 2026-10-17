import { describe, expect, it } from "vitest";
import { graceDue } from "./seasonGrace";

describe("season grace", () => {
  it("helps once a season on Standard when coins go below zero", () => {
    expect(graceDue({ difficulty: "standard", coins: -1, graceSeason: 0, seasonNumber: 1 })).toBe(true);
    expect(graceDue({ difficulty: "standard", coins: 0, graceSeason: 0, seasonNumber: 1 })).toBe(false);
    expect(graceDue({ difficulty: "standard", coins: -1, graceSeason: 1, seasonNumber: 1 })).toBe(false);
    expect(graceDue({ difficulty: "standard", coins: -1, graceSeason: 1, seasonNumber: 2 })).toBe(true);
  });

  it("never applies on Relaxed or Challenging", () => {
    expect(graceDue({ difficulty: "relaxed", coins: -5, graceSeason: 0, seasonNumber: 1 })).toBe(false);
    expect(graceDue({ difficulty: "challenging", coins: -5, graceSeason: 0, seasonNumber: 1 })).toBe(false);
  });
});
