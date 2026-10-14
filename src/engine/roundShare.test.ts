import { describe, expect, it } from "vitest";
import { roundShare } from "./roundShare";

describe("roundShare", () => {
  it("rounds a share to three decimal places", () => {
    expect(roundShare(0.12345)).toBe(0.123);
    expect(roundShare(0.9996)).toBe(1);
    expect(roundShare(0)).toBe(0);
  });
});
