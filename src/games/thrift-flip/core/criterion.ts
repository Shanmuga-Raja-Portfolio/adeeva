import type { Criterion as ScoredCriterion } from "../../../engine/score";

export const CRITERION_IDS = [
  "construction",
  "quality",
  "style",
  "colours",
  "finishes",
  "budget",
  "deadline",
  "sustainability",
] as const;
export type CriterionId = (typeof CRITERION_IDS)[number];

export const CRITERION_WEIGHTS: Readonly<Record<CriterionId, number>> = {
  construction: 3,
  quality: 2,
  style: 2,
  colours: 1,
  finishes: 1,
  budget: 1,
  deadline: 1,
  sustainability: 1,
};

export const PASS_GATE: readonly CriterionId[] = ["construction", "style", "finishes", "quality"];

export type Criterion = ScoredCriterion<CriterionId>;
