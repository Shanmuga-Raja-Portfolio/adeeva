import { describe, expect, it } from "vitest";
import { isCount } from "./count";

describe("isCount", () => {
  it("accepts whole numbers from zero and rejects everything else", () => {
    expect(isCount(0)).toBe(true);
    expect(isCount(7)).toBe(true);
    expect(isCount(-1)).toBe(false);
    expect(isCount(1.5)).toBe(false);
    expect(isCount(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
    expect(isCount(Number.NaN)).toBe(false);
  });
});
