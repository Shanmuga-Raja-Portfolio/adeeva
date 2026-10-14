import { describe, expect, it } from "vitest";
import { criterionPassed, kidSkillLine } from "./kidLine";

const bands = { great: 0.85, good: 0.6 };
const words = ["great", "good", "try"] as const;

describe("kid lines", () => {
  it("picks a word by band and marks the good ones", () => {
    expect(kidSkillLine("saw", "Sawing", 0.9, words, bands)).toEqual({
      id: "saw",
      label: "Sawing",
      verdict: "great",
      good: true,
    });
    expect(kidSkillLine("saw", "Sawing", 0.6, words, bands).verdict).toBe("good");
    expect(kidSkillLine("saw", "Sawing", 0.59, words, bands)).toMatchObject({ verdict: "try", good: false });
  });

  it("reads whether a criterion passed", () => {
    const criteria = [
      { id: "style", passed: true },
      { id: "budget", passed: false },
    ];
    expect(criterionPassed(criteria, "style")).toBe(true);
    expect(criterionPassed(criteria, "budget")).toBe(false);
    expect(criterionPassed(criteria, "deadline")).toBe(false);
  });
});
