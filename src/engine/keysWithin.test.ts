import { describe, expect, it } from "vitest";
import { keysWithin } from "./keysWithin";

describe("keysWithin", () => {
  it("checks every key of a record is allowed", () => {
    expect(keysWithin({}, [])).toBe(true);
    expect(keysWithin({ a: 1, b: 2 }, ["a", "b", "c"])).toBe(true);
    expect(keysWithin({ a: 1, z: 2 }, ["a", "b"])).toBe(false);
  });
});
