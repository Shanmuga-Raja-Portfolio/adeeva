import { describe, expect, it } from "vitest";
import { gatePassed, passMix, starsForScore, type Criterion } from "./score";

describe("score", () => {
  const criteria: Criterion<"a" | "b" | "c">[] = [
    { id: "a", label: "A", passed: true, detail: "", weight: 3 },
    { id: "b", label: "B", passed: false, detail: "", weight: 1 },
    { id: "c", label: "C", passed: true, detail: "", weight: 0 },
  ];

  it("weights the pass mix and checks a gate", () => {
    expect(passMix(criteria)).toBe(75);
    expect(passMix([])).toBe(0);
    expect(gatePassed(criteria, ["a", "c"])).toBe(true);
    expect(gatePassed(criteria, ["a", "b"])).toBe(false);
  });

  it("turns a score into one to five stars", () => {
    expect([100, 90, 89, 75, 55, 35, 34, 0].map(starsForScore)).toEqual([5, 5, 4, 4, 3, 2, 1, 1]);
  });
});
