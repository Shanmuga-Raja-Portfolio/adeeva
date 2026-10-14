import type { CommissionRun } from "./commissionRun";
import type { CriterionId } from "./criterion";
import type { Evaluation } from "./pieceEvaluate";
import { extraTallies } from "./requiredExtras";

interface KidLine {
  readonly id: string;
  readonly label: string;
  readonly verdict: string;
  readonly good: boolean;
}

const GREAT = 0.85;
const GOOD = 0.65;

function skillLine(
  id: string,
  label: string,
  value: number,
  words: readonly [string, string, string],
): KidLine {
  const verdict = value >= GREAT ? words[0] : value >= GOOD ? words[1] : words[2];
  return { id, label, verdict, good: value >= GOOD };
}

function passed(evaluation: Evaluation, id: CriterionId): boolean {
  return evaluation.criteria.find((criterion) => criterion.id === id)?.passed === true;
}

export function kidSummary(evaluation: Evaluation, run: CommissionRun): KidLine[] {
  const { quality } = evaluation;
  const missing = extraTallies(run).reduce((sum, tally) => sum + Math.max(0, tally.needed - tally.placed), 0);
  const over = evaluation.spend - run.brief.budget;
  return [
    skillLine("saw", "Sawing", quality.saw, ["right on the line!", "nice and steady", "a bit wobbly"]),
    skillLine("join", "Joints", quality.join, ["snug!", "holding well", "a little loose"]),
    skillLine("sand", "Sanding", quality.sand, ["silky smooth!", "smooth", "a few rough spots"]),
    skillLine("grain", "Wood lines", quality.grain, ["great!", "mostly running long", "some run across"]),
    {
      id: "style",
      label: "Style",
      verdict: passed(evaluation, "style") ? "just what they wanted!" : "not quite their style",
      good: passed(evaluation, "style"),
    },
    {
      id: "colours",
      label: "Colours",
      verdict: passed(evaluation, "colours") ? "lovely!" : "one colour they hoped to avoid",
      good: passed(evaluation, "colours"),
    },
    {
      id: "extras",
      label: "Extras",
      verdict: passed(evaluation, "extras")
        ? "all there!"
        : `${missing} more ${missing === 1 ? "extra" : "extras"} needed`,
      good: passed(evaluation, "extras"),
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
      verdict: passed(evaluation, "deadline") ? "right on time!" : "a little late",
      good: passed(evaluation, "deadline"),
    },
  ];
}
