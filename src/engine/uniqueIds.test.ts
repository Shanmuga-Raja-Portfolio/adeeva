import { describe, expect, it } from "vitest";
import { hasUniqueIds } from "./uniqueIds";

describe("hasUniqueIds", () => {
  it("spots repeated ids", () => {
    expect(hasUniqueIds([])).toBe(true);
    expect(hasUniqueIds([{ id: "a" }, { id: "b" }])).toBe(true);
    expect(hasUniqueIds([{ id: "a" }, { id: "a" }])).toBe(false);
  });
});
