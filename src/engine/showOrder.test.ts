import { describe, expect, it } from "vitest";
import { closerStrength } from "./showOrder";

describe("show order closer strength", () => {
  it("is full marks for a single piece", () => {
    expect(closerStrength([72])).toBe(100);
  });

  it("rewards closing with the strongest piece and opening strong", () => {
    expect(closerStrength([80, 70, 90])).toBe(100);
    expect(closerStrength([70, 80, 90])).toBe(88);
    expect(closerStrength([90, 80, 45])).toBe(65);
  });

  it("treats an empty show as a calm close", () => {
    expect(closerStrength([])).toBe(100);
  });
});
