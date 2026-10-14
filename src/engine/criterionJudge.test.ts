import { describe, expect, it } from "vitest";
import { criterionJudge, judgeDeadline, judgedEvaluation, judgeQuality } from "./criterionJudge";
import type { ScoreRule } from "./score";

type Id = "construction" | "quality" | "deadline";

const judged = criterionJudge<Id>({ construction: 3, quality: 2, deadline: 1 });
const rule: ScoreRule = { passMixWeight: 0.3, qualityWeight: 0.7, colourBonusPer: 2, maxColourBonus: 4 };

describe("criterion judge", () => {
  it("weighs each criterion from the table", () => {
    expect(judged("construction", "Built", true, "All done.", "Build it.")).toEqual({
      criterion: { id: "construction", label: "Built", passed: true, detail: "All done.", weight: 3 },
      feedback: "Build it.",
    });
  });

  it("judges quality against the minimum", () => {
    const low = judgeQuality(judged, 40, 50, "Take more care.");
    expect(low.criterion.passed).toBe(false);
    expect(low.criterion.detail).toBe("Quality 40 against a minimum of 50.");
    expect(judgeQuality(judged, 50, 50, "").criterion.passed).toBe(true);
  });

  it("judges the deadline under the given label", () => {
    const late = judgeDeadline(judged, "On time", 6, 5);
    expect(late.criterion.label).toBe("On time");
    expect(late.criterion.passed).toBe(false);
    expect(late.criterion.detail).toBe("Delivered on day 6, due by day 5.");
    expect(judgeDeadline(judged, "Deadline", 5, 5).criterion.passed).toBe(true);
  });

  it("scores the results and keeps only failed feedback", () => {
    const results = [
      judged("construction", "Built", true, "", "build"),
      judgeQuality(judged, 80, 50, "care"),
      judgeDeadline(judged, "On time", 6, 5),
    ];
    const evaluation = judgedEvaluation(results, { quality: 80 }, 1, rule, ["construction", "quality"]);
    expect(evaluation.score).toBe(Math.round(0.3 * ((100 * 5) / 6) + 0.7 * 80 + 2));
    expect(evaluation.passed).toBe(true);
    expect(evaluation.feedback).toHaveLength(1);
    expect(evaluation.criteria.map((criterion) => criterion.id)).toEqual([
      "construction",
      "quality",
      "deadline",
    ]);
    expect(judgedEvaluation(results, { quality: 80 }, 0, rule, ["deadline"]).passed).toBe(false);
  });
});
