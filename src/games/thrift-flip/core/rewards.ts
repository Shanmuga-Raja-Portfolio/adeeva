import type { DifficultyId } from "../../../engine/difficulty";
import type { TraitId } from "../../../engine/trait";
import type { StyleTag } from "../../../engine/styleTag";
import { settleTrendReward, type TrendReward, type TrendRewardLabels } from "../../../engine/trendReward";
import type { Brief } from "./brief";
import type { FlipEvaluation } from "./flipEvaluate";
import { LEAF_PICK_THRESHOLD } from "./sustainability";

export type { RewardLine, RewardOutcome } from "../../../engine/reward";

export const LEAF_PICK_BUZZ = 1;

const FLIP_LABELS: TrendRewardLabels = { trend: "Crowd favourite", dreamer: "Patchwork heart" };

export interface Reward extends TrendReward {
  readonly leafPick: boolean;
}

export interface RewardContext {
  readonly difficulty: DifficultyId;
  readonly trait: TraitId;
  readonly hotTags: readonly StyleTag[];
}

export function flipRewards(evaluation: FlipEvaluation, brief: Brief, context: RewardContext): Reward {
  const leafPick = evaluation.leaves.leaves >= LEAF_PICK_THRESHOLD;
  const late = evaluation.criteria.some((criterion) => criterion.id === "deadline" && !criterion.passed);
  const reward = settleTrendReward({
    passed: evaluation.passed,
    score: evaluation.score,
    stars: evaluation.stars,
    fee: brief.fee,
    late,
    difficulty: context.difficulty,
    trait: context.trait,
    hotTags: context.hotTags,
    tags: evaluation.tags,
    colourCount: evaluation.colours.length,
    labels: FLIP_LABELS,
    extraBuzz: leafPick ? LEAF_PICK_BUZZ : 0,
  });
  return { ...reward, leafPick: reward.outcome === "pass" && leafPick };
}
