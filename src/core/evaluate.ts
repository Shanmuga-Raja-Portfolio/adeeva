import type { Brief } from "./brief";
import { colourById, trimById } from "./catalog";
import { clamp } from "./clamp";
import { CRITERION_WEIGHTS, type Criterion, type CriterionId } from "./criterion";
import { dressQuality, type QualityBreakdown } from "./dressQuality";
import { constructionCount, isConstructionComplete, type DressSnapshot } from "./dressSnapshot";
import {
  budgetFeedback,
  coloursFeedback,
  constructionFeedback,
  deadlineFeedback,
  qualityFeedback,
  styleFeedback,
  trimsFeedback,
  type TrimShortfall,
} from "./kindFeedback";

export const FAVOURED_COLOUR_BONUS = 3;
export const MAX_FAVOURED_COLOUR_BONUS = 9;
export const STAR_THRESHOLDS = [90, 75, 55, 35] as const;
export const PASS_GATE: readonly CriterionId[] = ["construction", "style", "trims", "quality"];

export interface EvaluationContext {
  readonly deliveredDay: number;
}

export interface Evaluation {
  readonly criteria: readonly Criterion[];
  readonly quality: QualityBreakdown;
  readonly favouredColoursUsed: number;
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

function judgeConstruction(snapshot: DressSnapshot): Judged {
  const count = constructionCount(snapshot);
  const passed = isConstructionComplete(snapshot);
  const detail = `${count.piecesCut}/${count.piecesTotal} pieces cut, ${count.piecesAssembled}/${count.piecesTotal} on the form, ${count.seamsSewn}/${count.seamsTotal} seams sewn.`;
  return judged("construction", "Construction", passed, detail, constructionFeedback(count));
}

function judgeQuality(quality: QualityBreakdown, brief: Brief): Judged {
  const passed = quality.quality >= brief.minQuality;
  const detail = `Quality ${quality.quality} against a minimum of ${brief.minQuality}.`;
  return judged("quality", "Quality", passed, detail, qualityFeedback(quality, brief.minQuality));
}

function judgeStyle(snapshot: DressSnapshot, brief: Brief): Judged {
  const missing = brief.requiredTags.filter((tag) => !snapshot.tags.includes(tag));
  const detail =
    missing.length === 0
      ? `Feels ${brief.requiredTags.join(" and ")}, just as asked.`
      : `Still missing: ${missing.join(", ")}.`;
  return judged("style", "Style", missing.length === 0, detail, styleFeedback(missing));
}

function judgeColours(snapshot: DressSnapshot, brief: Brief, favouredUsed: number): Judged {
  const avoided = snapshot.colours
    .filter((colour) => brief.avoidColours.includes(colour))
    .map((colour) => colourById(colour).name);
  const detail =
    avoided.length === 0
      ? `No unwanted colours. ${favouredUsed} favourite ${favouredUsed === 1 ? "shade" : "shades"} used.`
      : `Uses ${avoided.join(", ")}, which the client hoped to avoid.`;
  return judged("colours", "Colours", avoided.length === 0, detail, coloursFeedback(avoided));
}

function judgeTrims(snapshot: DressSnapshot, brief: Brief): Judged {
  const shortfalls: TrimShortfall[] = brief.requiredTrims.flatMap((requirement) => {
    const placed = snapshot.decorations.filter((decoration) => decoration.trimId === requirement.trim).length;
    return placed >= requirement.count
      ? []
      : [{ name: trimById(requirement.trim).name, needed: requirement.count, placed }];
  });
  const detail =
    brief.requiredTrims.length === 0
      ? "No trims were requested."
      : brief.requiredTrims
          .map((requirement) => {
            const placed = snapshot.decorations.filter(
              (decoration) => decoration.trimId === requirement.trim,
            ).length;
            return `${trimById(requirement.trim).name} ${Math.min(placed, requirement.count)}/${requirement.count}`;
          })
          .join(", ");
  return judged("trims", "Trims", shortfalls.length === 0, detail, trimsFeedback(shortfalls));
}

function judgeBudget(snapshot: DressSnapshot, brief: Brief): Judged {
  const passed = snapshot.spend <= brief.budget;
  const detail = `Spent ${snapshot.spend} of ${brief.budget} coins.`;
  return judged("budget", "Budget", passed, detail, budgetFeedback(snapshot.spend, brief.budget));
}

function judgeDeadline(brief: Brief, context: EvaluationContext): Judged {
  const passed = context.deliveredDay <= brief.deadlineDay;
  const detail = `Delivered on day ${context.deliveredDay}, due by day ${brief.deadlineDay}.`;
  return judged(
    "deadline",
    "Deadline",
    passed,
    detail,
    deadlineFeedback(context.deliveredDay, brief.deadlineDay),
  );
}

export function starsForScore(score: number): number {
  const reached = STAR_THRESHOLDS.findIndex((threshold) => score >= threshold);
  return reached === -1 ? 1 : 5 - reached;
}

export function evaluate(snapshot: DressSnapshot, brief: Brief, context: EvaluationContext): Evaluation {
  const quality = dressQuality(snapshot, brief);
  const favouredColoursUsed = snapshot.colours.filter((colour) =>
    brief.favouredColours.includes(colour),
  ).length;
  const results = [
    judgeConstruction(snapshot),
    judgeQuality(quality, brief),
    judgeStyle(snapshot, brief),
    judgeColours(snapshot, brief, favouredColoursUsed),
    judgeTrims(snapshot, brief),
    judgeBudget(snapshot, brief),
    judgeDeadline(brief, context),
  ];
  const criteria = results.map((result) => result.criterion);
  const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  const passedWeight = criteria.reduce(
    (sum, criterion) => sum + (criterion.passed ? criterion.weight : 0),
    0,
  );
  const passMix = (100 * passedWeight) / totalWeight;
  const colourBonus = Math.min(MAX_FAVOURED_COLOUR_BONUS, FAVOURED_COLOUR_BONUS * favouredColoursUsed);
  const score = clamp(Math.round(0.5 * passMix + 0.5 * quality.quality + colourBonus), 0, 100);
  const passed = PASS_GATE.every((id) => criteria.find((criterion) => criterion.id === id)?.passed === true);
  return {
    criteria,
    quality,
    favouredColoursUsed,
    score,
    stars: starsForScore(score),
    passed,
    feedback: results.filter((result) => !result.criterion.passed).map((result) => result.feedback),
  };
}
