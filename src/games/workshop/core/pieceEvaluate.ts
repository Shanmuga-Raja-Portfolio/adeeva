import { budgetFeedback, coloursFeedback, deadlineFeedback } from "../../../engine/kindFeedback";
import { gatePassed, judgedScore, starsForScore } from "../../../engine/score";
import type { ShadeId } from "../content/shade";
import { extraById, shadeById } from "./catalog";
import type { CommissionRun } from "./commissionRun";
import { CRITERION_WEIGHTS, PASS_GATE, SCORE_RULE, type Criterion, type CriterionId } from "./criterion";
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

export interface Evaluation {
  readonly criteria: readonly Criterion[];
  readonly quality: QualityBreakdown;
  readonly favouredColoursUsed: number;
  readonly spend: number;
  readonly score: number;
  readonly stars: number;
  readonly passed: boolean;
  readonly feedback: readonly string[];
}

interface Judged {
  readonly criterion: Criterion;
  readonly feedback: string;
}

function judged(id: CriterionId, label: string, passed: boolean, detail: string, feedback: string): Judged {
  return { criterion: { id, label, passed, detail, weight: CRITERION_WEIGHTS[id] }, feedback };
}

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
  const missingTags = brief.requiredTags.filter((tag) => !tags.includes(tag));
  const avoided = colours.filter((colour) => brief.avoidColours.includes(colour));
  const tallies = extraTallies(run);
  const short = tallies.filter((tally) => tally.placed < tally.needed);
  const results: Judged[] = [
    judged(
      "construction",
      "Built",
      isConstructionComplete(count),
      `${count.sawn}/${count.parts} parts sawn, ${count.seated}/${count.joints} joints snug, ${count.sanded}/${count.surfaces} surfaces sanded.`,
      constructionFeedback(count),
    ),
    judged(
      "quality",
      "Quality",
      quality.quality >= brief.minQuality,
      `Quality ${quality.quality} against a minimum of ${brief.minQuality}.`,
      qualityFeedback(quality, brief.minQuality),
    ),
    judged(
      "style",
      "Style",
      missingTags.length === 0,
      missingTags.length === 0
        ? `Feels ${brief.requiredTags.join(" and ")}, just as asked.`
        : `Still missing: ${missingTags.join(", ")}.`,
      styleFeedback(missingTags),
    ),
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
    judged(
      "deadline",
      "On time",
      deliveredDay <= brief.deadlineDay,
      `Delivered on day ${deliveredDay}, due by day ${brief.deadlineDay}.`,
      deadlineFeedback(deliveredDay, brief.deadlineDay),
    ),
  ];
  const criteria = results.map((result) => result.criterion);
  const score = judgedScore(criteria, quality.quality, favouredColoursUsed, SCORE_RULE);
  return {
    criteria,
    quality,
    favouredColoursUsed,
    spend,
    score,
    stars: starsForScore(score),
    passed: gatePassed(criteria, PASS_GATE),
    feedback: results.filter((result) => !result.criterion.passed).map((result) => result.feedback),
  };
}
