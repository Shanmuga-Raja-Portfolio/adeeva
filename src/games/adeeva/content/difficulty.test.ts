import { describe, expect, it } from "vitest";
import { DIFFICULTY_IDS, DIFFICULTY_RULES } from "../../../engine/difficulty";
import { DIFFICULTIES } from "./difficulty";

describe("ADEEVA difficulties", () => {
  it("cover every difficulty in order with the shared rules", () => {
    expect(DIFFICULTIES.map((difficulty) => difficulty.id)).toEqual([...DIFFICULTY_IDS]);
    for (const difficulty of DIFFICULTIES) {
      expect({
        rentMultiplier: difficulty.rentMultiplier,
        toleranceMultiplier: difficulty.toleranceMultiplier,
        minQualityBonus: difficulty.minQualityBonus,
      }).toEqual(DIFFICULTY_RULES[difficulty.id]);
    }
  });

  it("keep the rules ADEEVA was tuned with", () => {
    expect(DIFFICULTIES.map((d) => [d.rentMultiplier, d.toleranceMultiplier, d.minQualityBonus])).toEqual([
      [0, 1.3, 0],
      [1, 1, 0],
      [1.5, 0.85, 6],
    ]);
  });
});
