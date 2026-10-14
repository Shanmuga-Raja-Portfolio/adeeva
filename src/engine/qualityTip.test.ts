import { describe, expect, it } from "vitest";
import { qualityTipLine } from "./qualityTip";

describe("qualityTipLine", () => {
  it("names the quality, the minimum and the weakest tip", () => {
    expect(
      qualityTipLine("The room", 61, 70, [
        [0.9, "paint"],
        [0.2, "light"],
      ]),
    ).toBe("The room reached 61, a little under the 70 hoped for. Try light.");
  });

  it("keeps the first of two equally weak tips", () => {
    expect(
      qualityTipLine("The finish", 40, 50, [
        [0.8, "cut"],
        [0.4, "sew"],
        [0.4, "press"],
      ]),
    ).toBe("The finish reached 40, a little under the 50 hoped for. Try sew.");
  });
});
