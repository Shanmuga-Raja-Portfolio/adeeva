import { describe, expect, it } from "vitest";
import { polylineLength } from "./polylineLength";

describe("polylineLength", () => {
  it("adds up each step of a stroke", () => {
    expect(polylineLength([])).toBe(0);
    expect(polylineLength([[2, 2]])).toBe(0);
    expect(
      polylineLength([
        [0, 0],
        [3, 4],
        [3, 10],
      ]),
    ).toBe(11);
  });
});
