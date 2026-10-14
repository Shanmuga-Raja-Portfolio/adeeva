import type { Criterion as ScoredCriterion, ScoreRule } from "../../../engine/score";

export const CRITERION_IDS = ["construction", "quality", "fit", "plating", "budget", "deadline"] as const;
export type CriterionId = (typeof CRITERION_IDS)[number];

export const CRITERION_WEIGHTS: Readonly<Record<CriterionId, number>> = {
  construction: 3,
  quality: 2,
  fit: 2,
  plating: 1,
  budget: 1,
  deadline: 1,
};

export const PASS_GATE: readonly CriterionId[] = ["construction", "fit", "quality"];

export const SCORE_RULE: ScoreRule = {
  passMixWeight: 0.3,
  qualityWeight: 0.7,
  colourBonusPer: 1,
  maxColourBonus: 3,
};

export type Criterion = ScoredCriterion<CriterionId>;
