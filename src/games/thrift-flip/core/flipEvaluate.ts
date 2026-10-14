import {
  criterionJudge,
  judgeDeadline,
  judgedEvaluation,
  judgeQuality,
  type Evaluation as JudgedEvaluation,
  type Judged as JudgedCriterion,
} from "../../../engine/criterionJudge";
import { colourById, type ColourId } from "../../../engine/palette";
import { starsForScore, type ScoreRule } from "../../../engine/score";
import { budgetFeedback, coloursFeedback } from "../../../engine/kindFeedback";
import type { StyleTag } from "../../../engine/styleTag";
import type { FinishRequirement } from "../content/client";
import type { Brief } from "./brief";
import { findById, patchById, trimById } from "./catalog";
import { CRITERION_WEIGHTS, PASS_GATE, type CriterionId } from "./criterion";
import { finishSpend } from "./finishing";
import { flipPieces, flipSeams } from "./flipPieces";
import { flipQuality, type QualityBreakdown } from "./flipQuality";
import type { FlipRun } from "./flipRun";
import { flipColours, flipTags, mainFind } from "./flipTags";
import type { GameState } from "./gameState";
import {
  avoidedMaterialFeedback,
  constructionFeedback,
  FINISHES_FEEDBACK,
  qualityFeedback,
  styleFeedback,
  SUSTAINABILITY_FEEDBACK,
  type ConstructionGap,
} from "./kindFeedback";
import { isSeamSewn } from "./seamSewn";
import { leavesOf, type LeavesBreakdown } from "./sustainability";
import { findLines, isLineDone, lineRecord } from "./unpick";

export const FAVOURED_COLOUR_BONUS = 2;
export const MAX_FAVOURED_COLOUR_BONUS = 4;
const SCORE_RULE: ScoreRule = {
  passMixWeight: 0.3,
  qualityWeight: 0.7,
  colourBonusPer: FAVOURED_COLOUR_BONUS,
  maxColourBonus: MAX_FAVOURED_COLOUR_BONUS,
};

export interface FlipEvaluation extends JudgedEvaluation<CriterionId, QualityBreakdown> {
  readonly kind: "gig" | "own";
  readonly leaves: LeavesBreakdown;
  readonly tags: readonly StyleTag[];
  readonly colours: readonly ColourId[];
  readonly spend: number;
}

type Judged = JudgedCriterion<CriterionId>;

const judged = criterionJudge(CRITERION_WEIGHTS);

export function flipSpend(run: FlipRun): number {
  return run.finds.reduce((sum, owned) => sum + owned.price, 0) + finishSpend(run);
}

export function constructionGap(run: FlipRun): ConstructionGap {
  const stitchLines = run.finds.reduce(
    (sum, owned) =>
      sum +
      findLines(owned).filter((def, index) => !isLineDone(def, lineRecord(run, owned.id, index))).length,
    0,
  );
  const pieces = run.cutDone ? 0 : flipPieces(run.design).length;
  const seams = flipSeams(run.design).filter((seam) => !isSeamSewn(run, seam.id)).length;
  return { stitchLines, pieces, seams };
}

function requirementName(requirement: FinishRequirement): string {
  if (requirement.kind === "trim") return trimById(requirement.trim).name;
  return requirement.patch === "any" ? "Any patch" : patchById(requirement.patch).name;
}

export function placedForRequirement(run: FlipRun, requirement: FinishRequirement): number {
  return run.finishes.filter((finish) => {
    const { item } = finish;
    if (requirement.kind === "trim") return item.kind === "trim" && item.trimId === requirement.trim;
    return item.kind === "patch" && (requirement.patch === "any" || item.patchId === requirement.patch);
  }).length;
}

function judgeFinishes(run: FlipRun, brief: Brief): Judged {
  const short = brief.requiredFinishes.filter(
    (requirement) => placedForRequirement(run, requirement) < requirement.count,
  );
  const detail =
    brief.requiredFinishes.length === 0
      ? "No finishing touches were asked for."
      : brief.requiredFinishes
          .map(
            (requirement) =>
              `${requirementName(requirement)} ${Math.min(placedForRequirement(run, requirement), requirement.count)}/${requirement.count}`,
          )
          .join(", ");
  return judged("finishes", "Finishes", short.length === 0, detail, FINISHES_FEEDBACK);
}

function judgeStyle(run: FlipRun, brief: Brief, tags: readonly StyleTag[]): Judged {
  const missing = brief.requiredTags.filter((tag) => !tags.includes(tag));
  const main = mainFind(run);
  const material = main === null ? null : findById(main.findId).material;
  const avoided = material !== null && brief.avoidMaterials.includes(material);
  const detail =
    missing.length > 0
      ? `Still missing: ${missing.join(", ")}.`
      : avoided
        ? `Made mostly from ${material}, which the client hoped to avoid.`
        : `Feels ${brief.requiredTags.join(" and ")}, just as asked.`;
  const feedback = missing.length > 0 ? styleFeedback(missing) : avoidedMaterialFeedback(material ?? "");
  return judged("style", "Style", missing.length === 0 && !avoided, detail, feedback);
}

function judgeColours(colours: readonly ColourId[], brief: Brief, favoured: number): Judged {
  const avoided = colours
    .filter((colour) => brief.avoidColours.includes(colour))
    .map((id) => colourById(id).name);
  const detail =
    avoided.length === 0
      ? `No unwanted colours. ${favoured} favourite ${favoured === 1 ? "shade" : "shades"} used.`
      : `Uses ${avoided.join(", ")}, which the client hoped to avoid.`;
  return judged("colours", "Colours", avoided.length === 0, detail, coloursFeedback(avoided));
}

export function evaluateFlip(state: GameState, run: FlipRun, deliveredDay: number): FlipEvaluation {
  const sharpRipper = state.upgrades.includes("sharp-ripper");
  const quality = flipQuality(state, run);
  const leaves = leavesOf(run, sharpRipper);
  const tags = flipTags(run);
  const colours = flipColours(run);
  const spend = flipSpend(run);
  const brief = run.brief;
  if (brief === null)
    return {
      kind: "own",
      criteria: [],
      quality,
      leaves,
      favouredColoursUsed: 0,
      score: quality.quality,
      stars: starsForScore(quality.quality),
      passed: true,
      feedback: [],
      tags,
      colours,
      spend,
    };
  const gap = constructionGap(run);
  const built = gap.stitchLines === 0 && gap.pieces === 0 && gap.seams === 0;
  const favoured = colours.filter((colour) => brief.favouredColours.includes(colour)).length;
  const results: Judged[] = [
    judged(
      "construction",
      "Construction",
      built,
      built
        ? "Every stitch out, every piece cut, every seam sewn."
        : `${gap.stitchLines} stitch lines, ${gap.pieces} pieces and ${gap.seams} seams left to do.`,
      constructionFeedback(gap),
    ),
    judgeQuality(judged, quality.quality, brief.minQuality, qualityFeedback(quality, brief.minQuality)),
    judgeStyle(run, brief, tags),
    judgeColours(colours, brief, favoured),
    judgeFinishes(run, brief),
    judged(
      "budget",
      "Budget",
      spend <= brief.budget,
      `Spent ${spend} of ${brief.budget} coins.`,
      budgetFeedback(spend, brief.budget),
    ),
    judgeDeadline(judged, "Deadline", deliveredDay, brief.deadlineDay),
    judged(
      "sustainability",
      "Leaves",
      leaves.leaves >= brief.minLeaves,
      brief.minLeaves === 0
        ? `${leaves.leaves} leaves. No leaves goal this time.`
        : `${leaves.leaves} leaves against a minimum of ${brief.minLeaves}.`,
      SUSTAINABILITY_FEEDBACK,
    ),
  ];
  return {
    ...judgedEvaluation(results, quality, favoured, SCORE_RULE, PASS_GATE),
    kind: "gig",
    leaves,
    tags,
    colours,
    spend,
  };
}
