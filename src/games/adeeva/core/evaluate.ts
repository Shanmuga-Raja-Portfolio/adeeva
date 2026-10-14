import {
  criterionJudge,
  judgeDeadline,
  judgedEvaluation,
  judgeQuality,
  type Evaluation as JudgedEvaluation,
  type Judged as JudgedCriterion,
} from "../../../engine/criterionJudge";
import type { ScoreRule } from "../../../engine/score";
import type { Brief } from "./brief";
import { colourById } from "../../../engine/palette";
import { trimById } from "./catalog";
import { CRITERION_WEIGHTS, type CriterionId } from "./criterion";
import { dressQuality, type QualityBreakdown } from "./dressQuality";
import { constructionCount, isConstructionComplete, type DressSnapshot } from "./dressSnapshot";
import { budgetFeedback, coloursFeedback } from "../../../engine/kindFeedback";
import {
  constructionFeedback,
  qualityFeedback,
  styleFeedback,
  trimsFeedback,
  type TrimShortfall,
} from "./kindFeedback";

export const FAVOURED_COLOUR_BONUS = 3;
export const MAX_FAVOURED_COLOUR_BONUS = 9;
export const PASS_GATE: readonly CriterionId[] = ["construction", "style", "trims", "quality"];
const SCORE_RULE: ScoreRule = {
  passMixWeight: 0.5,
  qualityWeight: 0.5,
  colourBonusPer: FAVOURED_COLOUR_BONUS,
  maxColourBonus: MAX_FAVOURED_COLOUR_BONUS,
};

export interface EvaluationContext {
  readonly deliveredDay: number;
}

export type Evaluation = JudgedEvaluation<CriterionId, QualityBreakdown>;

type Judged = JudgedCriterion<CriterionId>;

const judged = criterionJudge(CRITERION_WEIGHTS);

function judgeConstruction(snapshot: DressSnapshot): Judged {
  const count = constructionCount(snapshot);
  const passed = isConstructionComplete(snapshot);
  const detail = `${count.piecesCut}/${count.piecesTotal} pieces cut, ${count.piecesAssembled}/${count.piecesTotal} on the form, ${count.seamsSewn}/${count.seamsTotal} seams sewn.`;
  return judged("construction", "Construction", passed, detail, constructionFeedback(count));
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

export function evaluate(snapshot: DressSnapshot, brief: Brief, context: EvaluationContext): Evaluation {
  const quality = dressQuality(snapshot, brief);
  const favouredColoursUsed = snapshot.colours.filter((colour) =>
    brief.favouredColours.includes(colour),
  ).length;
  const results = [
    judgeConstruction(snapshot),
    judgeQuality(judged, quality.quality, brief.minQuality, qualityFeedback(quality, brief.minQuality)),
    judgeStyle(snapshot, brief),
    judgeColours(snapshot, brief, favouredColoursUsed),
    judgeTrims(snapshot, brief),
    judgeBudget(snapshot, brief),
    judgeDeadline(judged, "Deadline", context.deliveredDay, brief.deadlineDay),
  ];
  return judgedEvaluation(results, quality, favouredColoursUsed, SCORE_RULE, PASS_GATE);
}
