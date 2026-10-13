import type { DifficultyId } from "../../../engine/difficulty";
import type { TraitId } from "../../../engine/trait";
import type { StyleTag } from "../../../engine/styleTag";
import { settleTrendReward, type TrendReward } from "../../../engine/trendReward";
import type { Brief } from "./brief";
import type { DressSnapshot } from "./dressSnapshot";
import type { Evaluation } from "./evaluate";

export type { RewardLine, RewardOutcome } from "../../../engine/reward";

export type Reward = TrendReward;

export interface RewardContext {
  readonly difficulty: DifficultyId;
  readonly trait: TraitId;
  readonly hotTags: readonly StyleTag[];
}

function isLate(evaluation: Evaluation): boolean {
  return evaluation.criteria.some((criterion) => criterion.id === "deadline" && !criterion.passed);
}

export function rewards(
  evaluation: Evaluation,
  brief: Brief,
  snapshot: DressSnapshot,
  context: RewardContext,
): Reward {
  return settleTrendReward({
    passed: evaluation.passed,
    score: evaluation.score,
    stars: evaluation.stars,
    fee: brief.fee,
    late: isLate(evaluation),
    difficulty: context.difficulty,
    trait: context.trait,
    hotTags: context.hotTags,
    tags: snapshot.tags,
    colourCount: snapshot.colours.length,
  });
}
