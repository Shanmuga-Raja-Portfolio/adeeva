import type { Criterion as ScoredCriterion, ScoreRule } from "../../../engine/score";

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

export const PASS_GATE: readonly CriterionId[] = ["construction", "style", "trims", "quality"];

export const SCORE_RULE: ScoreRule = {
  passMixWeight: 0.3,
  qualityWeight: 0.7,
  colourBonusPer: 2,
  maxColourBonus: 4,
};

export type Criterion = ScoredCriterion<CriterionId>;
