import { criterionPassed, kidSkillLine, type KidBands, type KidLine } from "../../../engine/kidLine";
import { litSpots } from "./lighting";
import { placedLights } from "./lightPlacement";
import { runRoom } from "./runRoom";
import type { MakeoverRun } from "./makeoverRun";
import type { Evaluation } from "./roomEvaluate";

const BANDS: KidBands = { great: 0.85, good: 0.6 };

function criterionLine(
  evaluation: Evaluation,
  id: string,
  label: string,
  words: readonly [string, string],
): KidLine {
  const good = criterionPassed(evaluation.criteria, id);
  return { id, label, verdict: good ? words[0] : words[1], good };
}

export function kidSummary(run: MakeoverRun, evaluation: Evaluation): KidLine[] {
  const { quality } = evaluation;
  const { lit, total } = litSpots(runRoom(run), run.plan.pieces, placedLights(run));
  const spots = `${lit} of ${total} ${total === 1 ? "spot" : "spots"}`;
  return [
    kidSkillLine(
      "flow",
      "Walk-through",
      quality.flow,
      ["roomy!", "easy", "next time, leave a wider path"],
      BANDS,
    ),
    kidSkillLine(
      "paint",
      "Walls",
      quality.paint,
      ["crisp!", "neat", "next time, go slowly along the tape"],
      BANDS,
    ),
    kidSkillLine(
      "floor",
      "Floor",
      quality.floor,
      ["snug!", "steady", "next time, line up with the shadow"],
      BANDS,
    ),
    {
      id: "light",
      label: "Light",
      verdict: lit === total ? spots : `${spots}. Next time, hang a lamp nearer the dim ones`,
      good: lit === total,
    },
    criterionLine(evaluation, "trims", "Must-haves", ["all there!", "one missing"]),
    criterionLine(evaluation, "budget", "Budget", ["on target!", "a little over"]),
  ];
}
