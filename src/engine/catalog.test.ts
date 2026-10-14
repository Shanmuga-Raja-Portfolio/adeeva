import { describe, expect, it } from "vitest";
import { memberOf, requireById } from "./catalog";

const shelf = [
  { id: "oak", grain: "straight" },
  { id: "ash", grain: "wavy" },
] as const;

describe("requireById", () => {
  it("returns the matching entry itself", () => {
    expect(requireById(shelf, "ash", "wood")).toBe(shelf[1]);
  });

  it("names the kind and id when an entry is missing", () => {
    expect(() => requireById(shelf, "pine", "wood")).toThrow("Missing wood in catalog: pine");
  });
});

describe("memberOf", () => {
  it("guards a string to one of the known ids", () => {
    const isFruit = memberOf(["apple", "pear"] as const);
    expect(isFruit("pear")).toBe(true);
    expect(isFruit("plum")).toBe(false);
  });
});
