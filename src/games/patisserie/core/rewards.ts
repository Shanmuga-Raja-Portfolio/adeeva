import { settleTrendReward, type TrendReward } from "../../../engine/trendReward";
import type { BakeRun } from "./bakeRun";
import type { Evaluation } from "./bakeEvaluate";
import { bakeTags } from "./bakeTags";
import type { Brief } from "./brief";
import type { GameState } from "./gameState";

export type { RewardLine, RewardOutcome } from "../../../engine/reward";

export type Reward = TrendReward;

export function bakeReward(state: GameState, run: BakeRun, brief: Brief, evaluation: Evaluation): Reward {
  return settleTrendReward({
    passed: evaluation.passed,
    score: evaluation.score,
    stars: evaluation.stars,
    fee: brief.fee,
    late: evaluation.criteria.some((criterion) => criterion.id === "deadline" && !criterion.passed),
    difficulty: state.profile.difficulty,
    trait: state.profile.trait,
    hotTags: state.trends.current,
    tags: bakeTags(run),
    colourCount: run.design.colours.length,
  });
}
