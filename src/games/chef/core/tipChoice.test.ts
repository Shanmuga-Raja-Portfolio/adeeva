import { describe, expect, it } from "vitest";
import { isTipChoice, LAST_TIP } from "./tipChoice";

describe("tip choice", () => {
  it("accepts the three tip bubbles and nothing else", () => {
    expect([0, 1, LAST_TIP].every(isTipChoice)).toBe(true);
    expect([-1, LAST_TIP + 1, 0.5, Number.NaN].some(isTipChoice)).toBe(false);
  });
});
