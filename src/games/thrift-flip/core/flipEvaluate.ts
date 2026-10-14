import { clamp } from "../../../engine/clamp";
import { colourById, type ColourId } from "../../../engine/palette";
import { gatePassed, passMix, starsForScore } from "../../../engine/score";
import { budgetFeedback, coloursFeedback, deadlineFeedback } from "../../../engine/kindFeedback";
import type { StyleTag } from "../../../engine/styleTag";
import type { FinishRequirement } from "../content/client";
import type { Brief } from "./brief";
import { findById, patchById, trimById } from "./catalog";
import { CRITERION_WEIGHTS, PASS_GATE, type Criterion, type CriterionId } from "./criterion";
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

export interface FlipEvaluation {
  readonly kind: "gig" | "own";
  readonly criteria: readonly Criterion[];
  readonly quality: QualityBreakdown;
  readonly leaves: LeavesBreakdown;
  readonly favouredColoursUsed: number;
  readonly score: number;
  readonly stars: number;
  readonly passed: boolean;
  readonly feedback: readonly string[];
  readonly tags: readonly StyleTag[];
  readonly colours: readonly ColourId[];
  readonly spend: number;
}

interface Judged {
  readonly criterion: Criterion;
  readonly feedback: string;
}

function judged(id: CriterionId, label: string, passed: boolean, detail: string, feedback: string): Judged {
  return { criterion: { id, label, passed, detail, weight: CRITERION_WEIGHTS[id] }, feedback };
}

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
    judged(
      "quality",
      "Quality",
      quality.quality >= brief.minQuality,
      `Quality ${quality.quality} against a minimum of ${brief.minQuality}.`,
      qualityFeedback(quality, brief.minQuality),
    ),
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
    judged(
      "deadline",
      "Deadline",
      deliveredDay <= brief.deadlineDay,
      `Delivered on day ${deliveredDay}, due by day ${brief.deadlineDay}.`,
      deadlineFeedback(deliveredDay, brief.deadlineDay),
    ),
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
  const criteria = results.map((result) => result.criterion);
  const colourBonus = Math.min(MAX_FAVOURED_COLOUR_BONUS, FAVOURED_COLOUR_BONUS * favoured);
  const score = clamp(Math.round(0.3 * passMix(criteria) + 0.7 * quality.quality + colourBonus), 0, 100);
  return {
    kind: "gig",
    criteria,
    quality,
    leaves,
    favouredColoursUsed: favoured,
    score,
    stars: starsForScore(score),
    passed: gatePassed(criteria, PASS_GATE),
    feedback: results.filter((result) => !result.criterion.passed).map((result) => result.feedback),
    tags,
    colours,
    spend,
  };
}
