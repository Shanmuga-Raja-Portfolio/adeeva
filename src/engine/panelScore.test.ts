import { describe, expect, it } from "vitest";
import { bestSubScore, panel, panelVerdict, subScore } from "./panelScore";
import { closerStrength } from "./showOrder";
import { wowScore } from "./wowScore";

describe("show panels", () => {
  it("weights parts into a whole score from 0 to 100", () => {
    const parts = [
      { id: "a", label: "A", value: 80, weight: 0.5, detail: "" },
      { id: "b", label: "B", value: 40, weight: 0.5, detail: "" },
    ];
    expect(panel("x", "X", parts).score).toBe(60);
    expect(panel("x", "X", [{ ...parts[0], value: 300, weight: 1 } as (typeof parts)[number]]).score).toBe(
      100,
    );
  });

  it("rewards saving the best for last and a strong opener", () => {
    expect(closerStrength([70, 60, 90])).toBe(100);
    expect(closerStrength([60, 70, 90])).toBe(88);
    expect(closerStrength([90, 60, 45])).toBe(65);
    expect(closerStrength([])).toBe(100);
  });

  it("counts wow trims and wow feelings", () => {
    expect(wowScore([])).toBe(0);
    expect(wowScore([{ wowTrims: 4, tags: ["bold"] }])).toBe(100);
    expect(
      wowScore([
        { wowTrims: 1, tags: ["casual"] },
        { wowTrims: 0, tags: ["dreamy"] },
      ]),
    ).toBe(31);
  });

  it("picks the part that adds the most and names a warm verdict", () => {
    const parts = [
      subScore("a", "A", 90, 0.2, ""),
      subScore("b", "B", 60, 0.5, ""),
      subScore("c", "C", 100, 0.35, ""),
    ];
    expect(bestSubScore(parts)?.id).toBe("c");
    expect(bestSubScore([])).toBeNull();
    expect([85, 84, 70, 69, 55, 54].map(panelVerdict)).toEqual([
      "Delighted",
      "Loved it",
      "Loved it",
      "Enjoyed it",
      "Enjoyed it",
      "Warmly cheered",
    ]);
  });
});
