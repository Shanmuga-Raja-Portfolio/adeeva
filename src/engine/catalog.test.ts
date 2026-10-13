import { describe, expect, it } from "vitest";
import { requireById } from "./catalog";

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
