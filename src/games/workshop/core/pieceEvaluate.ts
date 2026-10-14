import {
  criterionJudge,
  judgeDeadline,
  judgedEvaluation,
  judgeQuality,
  judgeStyle,
  type Evaluation as JudgedEvaluation,
  type Judged as JudgedCriterion,
} from "../../../engine/criterionJudge";
import { budgetFeedback, coloursFeedback } from "../../../engine/kindFeedback";
import type { ShadeId } from "../content/shade";
import { extraById, shadeById } from "./catalog";
import type { CommissionRun } from "./commissionRun";
import { CRITERION_WEIGHTS, PASS_GATE, SCORE_RULE, type CriterionId } from "./criterion";
import type { GameState } from "./gameState";
import { constructionFeedback, extrasFeedback, qualityFeedback, styleFeedback } from "./kindFeedback";
import { pieceColours } from "./pieceColours";
import {
  constructionCount,
  isConstructionComplete,
  pieceQuality,
  type QualityBreakdown,
} from "./pieceQuality";
import { pieceTags } from "./pieceTags";
import { extraTallies } from "./requiredExtras";
import { runSpend } from "./runSpend";

export interface Evaluation extends JudgedEvaluation<CriterionId, QualityBreakdown> {
  readonly spend: number;
}

const judged = criterionJudge(CRITERION_WEIGHTS);

function shadeNames(ids: readonly ShadeId[]): string[] {
  return ids.map((id) => shadeById(id).name);
}

export function evaluatePiece(state: GameState, run: CommissionRun, deliveredDay: number): Evaluation {
  const brief = run.brief;
  const count = constructionCount(state, run);
  const quality = pieceQuality(state, run);
  const tags = pieceTags(run);
  const colours = pieceColours(run);
  const spend = runSpend(state, run);
  const favouredColoursUsed = colours.filter((colour) => brief.favouredColours.includes(colour)).length;
  const avoided = colours.filter((colour) => brief.avoidColours.includes(colour));
  const tallies = extraTallies(run);
  const short = tallies.filter((tally) => tally.placed < tally.needed);
  const results: JudgedCriterion<CriterionId>[] = [
    judged(
      "construction",
      "Built",
      isConstructionComplete(count),
      `${count.sawn}/${count.parts} parts sawn, ${count.seated}/${count.joints} joints snug, ${count.sanded}/${count.surfaces} surfaces sanded.`,
      constructionFeedback(count),
    ),
    judgeQuality(judged, quality.quality, brief.minQuality, qualityFeedback(quality, brief.minQuality)),
    judgeStyle(judged, brief.requiredTags, tags, styleFeedback),
    judged(
      "colours",
      "Colours",
      avoided.length === 0,
      avoided.length === 0
        ? `No unwanted colours. ${favouredColoursUsed} favourite ${favouredColoursUsed === 1 ? "colour" : "colours"} used.`
        : `Uses ${shadeNames(avoided).join(", ")}, which they hoped to avoid.`,
      coloursFeedback(shadeNames(avoided)),
    ),
    judged(
      "extras",
      "Extras",
      short.length === 0,
      tallies.length === 0
        ? "No extras were requested."
        : tallies
            .map(
              (tally) =>
                `${extraById(tally.extra).name} ${Math.min(tally.placed, tally.needed)}/${tally.needed}`,
            )
            .join(", "),
      extrasFeedback(),
    ),
    judged(
      "budget",
      "Budget",
      spend <= brief.budget,
      `Used ${spend} of ${brief.budget} coins.`,
      budgetFeedback(spend, brief.budget),
    ),
    judgeDeadline(judged, "On time", deliveredDay, brief.deadlineDay),
  ];
  return { ...judgedEvaluation(results, quality, favouredColoursUsed, SCORE_RULE, PASS_GATE), spend };
}
