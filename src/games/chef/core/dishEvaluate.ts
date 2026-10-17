import {
  criterionJudge,
  judgeDeadline,
  judgedEvaluation,
  type Evaluation,
  type Judged,
} from "../../../engine/criterionJudge";
import type { DishDef } from "../content/dish";
import { cuisineById, dishById, ingredientById } from "./catalog";
import { CONSTRUCTION_LINE, fitLine, garnishLine, stepLine } from "./kindFeedback";
import { CRITERION_WEIGHTS, PASS_GATE, SCORE_RULE, type CriterionId } from "./criterion";
import { dishCost } from "./dishCost";
import { runAccuracies, runQuality, weakestStep, type StepAccuracies } from "./dishQuality";
import { currentCookStep, type DishRun } from "./dishRun";
import type { OrderBrief, OrderDish } from "./orderBrief";
import { cuisineJars, suggestedJar } from "./taste";

export interface DishQualityBreakdown {
  readonly quality: number;
  readonly accuracies: StepAccuracies;
}

export type DishEvaluation = Evaluation<CriterionId, DishQualityBreakdown>;

const judged = criterionJudge(CRITERION_WEIGHTS);

function judgeQuality(quality: number, minimum: number, feedback: string): Judged<CriterionId> {
  return judged(
    "quality",
    "Cooked well",
    quality >= minimum,
    `Quality ${quality}, hoping for ${minimum}.`,
    feedback,
  );
}

function qualityLine(run: DishRun, dish: DishDef, accuracies: StepAccuracies): string {
  const weakest = weakestStep(dish, accuracies);
  const taste = dish.taste;
  const final = run.taste;
  const jar =
    taste === null || final === null
      ? null
      : suggestedJar(taste, cuisineJars(dish.cuisine), { point: final.point, savoury: final.savoury });
  const sizzleSides = run.sizzle?.sides ?? [];
  const weakestCut = run.chop.reduce(
    (best, entry, index) => (entry.accuracy < (run.chop[best]?.accuracy ?? Infinity) ? index : best),
    0,
  );
  return stepLine(weakest, {
    chopHeld: dish.chop[weakestCut]?.cut === "mince",
    sizzleHeatFit: run.sizzle?.heatFit ?? 1,
    sizzleCrispy: sizzleSides.some((side) => side > 1.1),
    simmerFollow: run.simmer?.result?.follow ?? 1,
    simmerLevel: run.simmer?.result?.levelScore ?? 1,
    tasteJar: jar,
    plateInWell: run.plated?.result.inWell ?? 1,
    plateWiped: run.plated?.result.wiped ?? true,
  });
}

function avoidedIn(dish: DishDef, avoid: readonly string[]): string[] {
  return dish.ingredients.filter((id) => avoid.includes(id)).map((id) => ingredientById(id).name);
}

export function evaluateDish(run: DishRun, dish: DishDef): DishEvaluation {
  const accuracies = runAccuracies(run, dish);
  const quality = runQuality(run, dish);
  const finished = currentCookStep(run, dish) === null && run.plated !== null;
  const missing = run.brief.requiredTags.filter((tag) => !dish.tags.includes(tag));
  const avoided = avoidedIn(dish, run.brief.avoid);
  const garnishes = run.plated?.result.garnishes ?? 0;
  const results = [
    judged(
      "construction",
      "Every step done",
      finished,
      finished ? "Nothing was skipped." : "A step was left unfinished.",
      CONSTRUCTION_LINE,
    ),
    judgeQuality(quality, run.brief.minQuality, qualityLine(run, dish, accuracies)),
    judged(
      "fit",
      "What they asked for",
      missing.length === 0 && avoided.length === 0,
      missing.length === 0 && avoided.length === 0
        ? run.brief.requiredTags.length === 0
          ? "Cooked just as the ticket said."
          : `Feels ${run.brief.requiredTags.join(" and ")}, just as asked.`
        : "Not quite what they hoped for.",
      fitLine(missing, avoided),
    ),
    judged(
      "plating",
      "Plated as asked",
      run.plated?.result.garnishMet ?? false,
      `${garnishes} of ${dish.plate.garnishCount} ${dish.plate.garnishCount === 1 ? "garnish" : "garnishes"}.`,
      garnishLine(dish.plate.garnishCount),
    ),
  ];
  return judgedEvaluation(
    results,
    { quality, accuracies },
    run.plated?.result.colourCount ?? 0,
    SCORE_RULE,
    PASS_GATE,
  );
}

export interface OrderQuality {
  readonly quality: number;
}

export type OrderEvaluation = Evaluation<CriterionId, OrderQuality> & { readonly spend: number };

export function evaluateOrder(
  brief: OrderBrief,
  dishes: readonly OrderDish[],
  deliveredDay: number,
): OrderEvaluation {
  const defs = dishes.map((entry) => dishById(entry.dishId));
  const quality = Math.round(
    dishes.reduce((sum, entry) => sum + entry.quality, 0) / Math.max(1, dishes.length),
  );
  const tags = new Set(defs.flatMap((dish) => dish.tags));
  const missing = brief.requiredTags.filter((tag) => !tags.has(tag));
  const avoided = [...new Set(defs.flatMap((dish) => avoidedIn(dish, brief.avoid)))];
  const cuisines = new Set(defs.map((dish) => dish.cuisine)).size;
  const rightDish = brief.dishId === null || defs.every((dish) => dish.id === brief.dishId);
  const spend = defs.reduce((sum, dish) => sum + dishCost(dish), 0);
  const finished = dishes.length >= brief.dishCount;
  const fits = missing.length === 0 && avoided.length === 0 && cuisines >= brief.cuisines && rightDish;
  const fitDetail = fits
    ? `${cuisines} ${cuisines === 1 ? "kitchen" : "kitchens"}, just as asked.`
    : cuisines < brief.cuisines
      ? `They hoped for dishes from ${brief.cuisines} different kitchens.`
      : "Not quite what they hoped for.";
  const garnished = dishes.filter((entry) => entry.garnishMet).length;
  const lowest = dishes.reduce<OrderDish | null>(
    (worst, entry) => (worst === null || entry.quality < worst.quality ? entry : worst),
    null,
  );
  const results = [
    judged(
      "construction",
      "Every dish ready",
      finished,
      `${dishes.length} of ${brief.dishCount} dishes cooked.`,
      CONSTRUCTION_LINE,
    ),
    judgeQuality(
      quality,
      brief.minQuality,
      lowest === null
        ? CONSTRUCTION_LINE
        : `The ${dishById(lowest.dishId).name} could shine a little more. Take each step slowly.`,
    ),
    judged(
      "fit",
      "What they asked for",
      fits,
      fitDetail,
      cuisines < brief.cuisines
        ? `They hoped for dishes from ${brief.cuisines} kitchens, like ${defs.map((dish) => cuisineById(dish.cuisine).name).join(" and ")} and one more.`
        : fitLine(missing, avoided),
    ),
    judged(
      "plating",
      "Plated as asked",
      garnished === dishes.length,
      `${garnished} of ${dishes.length} plates garnished as asked.`,
      "So close! One plate needed another garnish.",
    ),
    judged(
      "budget",
      "Within budget",
      spend <= brief.budget,
      `Ingredients came to ${spend} coins, budget ${brief.budget}.`,
      `Ingredients came to ${spend} coins against a budget of ${brief.budget}. A few simpler dishes keep the cost down.`,
    ),
    judgeDeadline(judged, "On time", deliveredDay, brief.deadlineDay),
  ];
  const colours = Math.max(0, ...dishes.map((entry) => entry.colourCount));
  return { ...judgedEvaluation(results, { quality }, colours, SCORE_RULE, PASS_GATE), spend };
}
