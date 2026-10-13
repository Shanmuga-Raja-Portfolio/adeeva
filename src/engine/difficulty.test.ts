import { describe, expect, it } from "vitest";
import { weeklyRent } from "./difficulty";

describe("difficulty rent", () => {
  it("scales rent by difficulty", () => {
    expect([weeklyRent(45, "relaxed"), weeklyRent(45, "standard"), weeklyRent(45, "challenging")]).toEqual([
      0, 45, 68,
    ]);
  });
});
