import type { RewardLine } from "../../../engine/reward";
import { settleTrendReward, type TrendReward, type TrendRewardLabels } from "../../../engine/trendReward";
import type { WoodTag } from "../content/woodTag";
import type { CommissionRun } from "./commissionRun";
import { fineWoodBonus, fineWoodReputation } from "./fineWood";
import type { GameState } from "./gameState";
import type { Evaluation } from "./pieceEvaluate";
import { pieceColours } from "./pieceColours";
import { pieceTags } from "./pieceTags";

export type { RewardLine, RewardOutcome } from "../../../engine/reward";

export type Reward = TrendReward<WoodTag>;

const WORKSHOP_LABELS: TrendRewardLabels = { trend: "Neighbourhood favourite", dreamer: "Big ideas" };

function fineWoodLines(run: CommissionRun): RewardLine[] {
  const woodId = run.design.woodId;
  const fine = woodId === null ? 0 : fineWoodBonus(run.brief.fee, woodId);
  return fine > 0 ? [{ label: "Fine wood bonus", amount: fine }] : [];
}

export function pieceReward(state: GameState, run: CommissionRun, evaluation: Evaluation): Reward {
  const reward = settleTrendReward({
    passed: evaluation.passed,
    score: evaluation.score,
    stars: evaluation.stars,
    fee: run.brief.fee,
    late: evaluation.criteria.some((criterion) => criterion.id === "deadline" && !criterion.passed),
    difficulty: state.profile.difficulty,
    trait: state.profile.trait,
    hotTags: state.trends.current,
    tags: pieceTags(run),
    colourCount: pieceColours(run).length,
    labels: WORKSHOP_LABELS,
    extraLines: fineWoodLines(run),
  });
  const woodId = run.design.woodId;
  const extraReputation = reward.outcome === "pass" && woodId !== null ? fineWoodReputation(woodId) : 0;
  return { ...reward, reputation: reward.reputation + extraReputation };
}
