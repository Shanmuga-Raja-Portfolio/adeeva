import {
  criterionJudge,
  judgeDeadline,
  judgedEvaluation,
  judgeQuality,
  type Evaluation as JudgedEvaluation,
  type Judged as JudgedCriterion,
} from "../../../engine/criterionJudge";
import { budgetFeedback, coloursFeedback } from "../../../engine/kindFeedback";
import { colourById } from "../../../engine/palette";
import type { ScoreRule } from "../../../engine/score";
import { bakeQuality, type QualityBreakdown } from "./bakeQuality";
import { designMixes } from "./bakeNeeds";
import type { BakeRun } from "./bakeRun";
import { bakeSpend } from "./bakeSpend";
import { bakeTags } from "./bakeTags";
import type { Brief } from "./brief";
import { mixById, toppingById } from "./catalog";
import { constructionCount, isConstructionComplete } from "./construction";
import { CRITERION_WEIGHTS, PASS_GATE, type CriterionId } from "./criterion";
import {
  constructionFeedback,
  qualityFeedback,
  styleFeedback,
  toppingsFeedback,
  type ToppingShortfall,
} from "./kindFeedback";

export const SCORE_RULE: ScoreRule = {
  passMixWeight: 0.25,
  qualityWeight: 0.75,
  colourBonusPer: 1,
  maxColourBonus: 3,
};

export interface Evaluation extends JudgedEvaluation<CriterionId, QualityBreakdown> {
  readonly spend: number;
}

type Judged = JudgedCriterion<CriterionId>;

const judged = criterionJudge(CRITERION_WEIGHTS);

function judgeConstruction(run: BakeRun): Judged {
  const count = constructionCount(run);
  const detail = `${count.baked}/${count.batches} baked, ${count.piped}/${count.paths} icing lines piped.`;
  return judged(
    "construction",
    "Finished bake",
    isConstructionComplete(count),
    detail,
    constructionFeedback(count),
  );
}

function judgeStyle(run: BakeRun, brief: Brief): Judged {
  const tags = bakeTags(run);
  const missing = brief.requiredTags.filter((tag) => !tags.includes(tag));
  const mixes = designMixes(run.design).map((mix) => mix.id);
  const missingMixes = brief.requiredMixes.filter((mix) => !mixes.includes(mix));
  const avoided = mixes.filter((mix) => brief.avoidMixes.includes(mix));
  const flavourMissed = missingMixes.length > 0 || avoided.length > 0;
  const passed = missing.length === 0 && !flavourMissed;
  const notes = [
    missing.length > 0 ? `Still missing: ${missing.join(", ")}.` : "",
    missingMixes.length > 0 ? `Hoped for ${missingMixes.map((id) => mixById(id).name).join(", ")}.` : "",
    avoided.length > 0 ? `${avoided.map((id) => mixById(id).name).join(", ")} was not their flavour.` : "",
  ].filter((note) => note.length > 0);
  const detail = passed
    ? brief.requiredTags.length > 0
      ? `Feels ${brief.requiredTags.join(" and ")}, just as asked.`
      : "Just the flavour they wanted."
    : notes.join(" ");
  return judged("style", "Style and flavour", passed, detail, styleFeedback(missing, flavourMissed));
}

function judgeColours(run: BakeRun, brief: Brief, favouredUsed: number): Judged {
  const avoided = run.design.colours
    .filter((colour) => brief.avoidColours.includes(colour))
    .map((colour) => colourById(colour).name);
  const detail =
    avoided.length === 0
      ? `No unwanted colours. ${favouredUsed} favourite ${favouredUsed === 1 ? "shade" : "shades"} used.`
      : `Uses ${avoided.join(", ")}, which they hoped to avoid.`;
  return judged("colours", "Icing colours", avoided.length === 0, detail, coloursFeedback(avoided));
}

function judgeToppings(run: BakeRun, brief: Brief): Judged {
  const counted = brief.requiredToppings.map((requirement) => ({
    requirement,
    placed: run.toppings.filter((entry) => entry.toppingId === requirement.topping).length,
  }));
  const shortfalls: ToppingShortfall[] = counted.flatMap(({ requirement, placed }) =>
    placed >= requirement.count
      ? []
      : [{ name: toppingById(requirement.topping).name, needed: requirement.count, placed }],
  );
  const detail =
    counted.length === 0
      ? "No toppings were requested."
      : counted
          .map(
            ({ requirement, placed }) =>
              `${toppingById(requirement.topping).name} ${Math.min(placed, requirement.count)}/${requirement.count}`,
          )
          .join(", ");
  return judged("toppings", "Toppings", shortfalls.length === 0, detail, toppingsFeedback(shortfalls));
}

function judgeBudget(spend: number, brief: Brief): Judged {
  const detail = `Used ${spend} of ${brief.budget} coins of ingredients.`;
  return judged("budget", "Budget", spend <= brief.budget, detail, budgetFeedback(spend, brief.budget));
}

export function evaluateBake(run: BakeRun, brief: Brief, deliveredDay: number): Evaluation {
  const quality = bakeQuality(run);
  const spend = bakeSpend(run);
  const favouredColoursUsed = run.design.colours.filter((colour) =>
    brief.favouredColours.includes(colour),
  ).length;
  const results = [
    judgeConstruction(run),
    judgeQuality(judged, quality.quality, brief.minQuality, qualityFeedback(quality, brief.minQuality)),
    judgeStyle(run, brief),
    judgeColours(run, brief, favouredColoursUsed),
    judgeToppings(run, brief),
    judgeBudget(spend, brief),
    judgeDeadline(judged, "On time", deliveredDay, brief.deadlineDay),
  ];
  return { ...judgedEvaluation(results, quality, favouredColoursUsed, SCORE_RULE, PASS_GATE), spend };
}
