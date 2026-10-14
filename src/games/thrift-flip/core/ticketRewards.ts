import { settleReward } from "../../../engine/reward";
import type { Brief } from "./brief";
import type { FlipEvaluation } from "./flipEvaluate";
import { deliveredLate, type Reward, type RewardContext } from "./rewards";

export const TICKET_PASS_REPUTATION = 1;
export const TICKET_PASS_BUZZ = 1;

export function ticketRewards(
  evaluation: FlipEvaluation,
  brief: Brief,
  context: Pick<RewardContext, "difficulty" | "trait">,
): Reward {
  const core = settleReward({
    passed: evaluation.passed,
    score: evaluation.score,
    stars: 0,
    fee: brief.fee,
    late: deliveredLate(evaluation),
    difficulty: context.difficulty,
    trait: context.trait,
    bonusLines: [],
    extraBuzz: 0,
  });
  const passed = core.outcome === "pass";
  return {
    ...core,
    reputation: passed ? TICKET_PASS_REPUTATION : 0,
    buzz: passed ? TICKET_PASS_BUZZ : 0,
    trendMatches: [],
    leafPick: false,
  };
}
