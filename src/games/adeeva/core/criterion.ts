import type { Criterion as ScoredCriterion } from "../../../engine/score";

export const CRITERION_IDS = [
  "construction",
  "quality",
  "style",
  "colours",
  "trims",
  "budget",
  "deadline",
] as const;
export type CriterionId = (typeof CRITERION_IDS)[number];

export const CRITERION_WEIGHTS: Readonly<Record<CriterionId, number>> = {
  construction: 3,
  quality: 2,
  style: 2,
  colours: 1,
  trims: 1,
  budget: 1,
  deadline: 1,
};

export type Criterion = ScoredCriterion<CriterionId>;
