import { describe, expect, it } from "vitest";
import { sameList } from "./sameList";

describe("sameList", () => {
  it("compares lists in order, by identity unless told otherwise", () => {
    expect(sameList([], [])).toBe(true);
    expect(sameList(["a", "b"], ["a", "b"])).toBe(true);
    expect(sameList(["a", "b"], ["b", "a"])).toBe(false);
    expect(sameList(["a"], ["a", "b"])).toBe(false);
    expect(sameList([{ n: 1 }], [{ n: 1 }])).toBe(false);
    expect(sameList([{ n: 1 }], [{ n: 1 }], (x, y) => x.n === y.n)).toBe(true);
  });
});
