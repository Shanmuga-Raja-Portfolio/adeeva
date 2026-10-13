import { describe, expect, it } from "vitest";
import { applyStanding, decayBuzz, MAX_BUZZ } from "./standing";

describe("standing", () => {
  it("adds coins, floors reputation at zero and caps buzz", () => {
    const state = { coins: 10, reputation: 1, buzz: 95, name: "kept" };
    expect(applyStanding(state, { coins: -4, reputation: -3, buzz: 20 })).toEqual({
      coins: 6,
      reputation: 0,
      buzz: MAX_BUZZ,
      name: "kept",
    });
    expect([0, 1, 5].map(decayBuzz)).toEqual([0, 0, 3]);
  });
});
