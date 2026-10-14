import { criterionPassed, kidSkillLine, type KidBands, type KidLine } from "../../../engine/kidLine";
import type { CommissionRun } from "./commissionRun";
import type { Evaluation } from "./pieceEvaluate";
import { extraTallies } from "./requiredExtras";

const BANDS: KidBands = { great: 0.85, good: 0.65 };

export function kidSummary(evaluation: Evaluation, run: CommissionRun): KidLine[] {
  const { quality } = evaluation;
  const missing = extraTallies(run).reduce((sum, tally) => sum + Math.max(0, tally.needed - tally.placed), 0);
  const over = evaluation.spend - run.brief.budget;
  return [
    kidSkillLine(
      "saw",
      "Sawing",
      quality.saw,
      ["right on the line!", "nice and steady", "a bit wobbly"],
      BANDS,
    ),
    kidSkillLine("join", "Joints", quality.join, ["snug!", "holding well", "a little loose"], BANDS),
    kidSkillLine("sand", "Sanding", quality.sand, ["silky smooth!", "smooth", "a few rough spots"], BANDS),
    kidSkillLine(
      "grain",
      "Wood lines",
      quality.grain,
      ["great!", "mostly running long", "some run across"],
      BANDS,
    ),
    {
      id: "style",
      label: "Style",
      verdict: criterionPassed(evaluation.criteria, "style")
        ? "just what they wanted!"
        : "not quite their style",
      good: criterionPassed(evaluation.criteria, "style"),
    },
    {
      id: "colours",
      label: "Colours",
      verdict: criterionPassed(evaluation.criteria, "colours") ? "lovely!" : "one colour they hoped to avoid",
      good: criterionPassed(evaluation.criteria, "colours"),
    },
    {
      id: "extras",
      label: "Extras",
      verdict: criterionPassed(evaluation.criteria, "extras")
        ? "all there!"
        : `${missing} more ${missing === 1 ? "extra" : "extras"} needed`,
      good: criterionPassed(evaluation.criteria, "extras"),
    },
    {
      id: "budget",
      label: "Budget",
      verdict: over <= 0 ? "on target!" : `${over} ${over === 1 ? "coin" : "coins"} over`,
      good: over <= 0,
    },
    {
      id: "deadline",
      label: "Delivery",
      verdict: criterionPassed(evaluation.criteria, "deadline") ? "right on time!" : "a little late",
      good: criterionPassed(evaluation.criteria, "deadline"),
    },
  ];
}
