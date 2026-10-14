import { describe, expect, it } from "vitest";
import {
  criterionJudge,
  judgeAvoidedColours,
  judgeDeadline,
  judgedEvaluation,
  judgeQuality,
  judgeStyle,
} from "./criterionJudge";
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

describe("style and colour judges", () => {
  const judge = criterionJudge<"style" | "colours">({ style: 2, colours: 1 });

  it("checks every asked-for tag is there", () => {
    const feedback = (missing: readonly string[]) => `missing ${missing.length}`;
    expect(judgeStyle(judge, ["cosy", "bold"], ["bold", "cosy", "calm"], feedback)).toEqual({
      criterion: {
        id: "style",
        label: "Style",
        passed: true,
        detail: "Feels cosy and bold, just as asked.",
        weight: 2,
      },
      feedback: "missing 0",
    });
    const short = judgeStyle(judge, ["cosy", "bold"], ["cosy"], feedback);
    expect(short.criterion.passed).toBe(false);
    expect(short.criterion.detail).toBe("Still missing: bold.");
    expect(short.feedback).toBe("missing 1");
  });

  it("names the colours they hoped to avoid and counts favourites otherwise", () => {
    expect(judgeAvoidedColours(judge, [], 1).criterion).toEqual({
      id: "colours",
      label: "Colours",
      passed: true,
      detail: "No unwanted colours. 1 favourite colour used.",
      weight: 1,
    });
    expect(judgeAvoidedColours(judge, [], 2).criterion.detail).toBe(
      "No unwanted colours. 2 favourite colours used.",
    );
    const avoided = judgeAvoidedColours(judge, ["Mustard", "Grey"], 0);
    expect(avoided.criterion.passed).toBe(false);
    expect(avoided.criterion.detail).toBe("Shows Mustard, Grey, which they hoped to avoid.");
    expect(avoided.feedback).toContain("Mustard and Grey");
  });
});
