import { fineMaterialBonus } from "../../../engine/fineMaterial";
import { settleTrendReward, type TrendReward, type TrendRewardLabels } from "../../../engine/trendReward";
import { hammersFor } from "../content/wood";
import type { WoodTag } from "../content/woodTag";
import type { CommissionRun } from "./commissionRun";
import { woodById } from "./catalog";
import type { GameState } from "./gameState";
import type { Evaluation } from "./pieceEvaluate";
import { pieceColours } from "./pieceColours";
import { pieceTags } from "./pieceTags";

export type { RewardLine, RewardOutcome } from "../../../engine/reward";

export type Reward = TrendReward<WoodTag>;

const WORKSHOP_LABELS: TrendRewardLabels = { trend: "Neighbourhood favourite", dreamer: "Big ideas" };

const FINE_WOOD_LABEL = "Fine wood bonus";

export function pieceReward(state: GameState, run: CommissionRun, evaluation: Evaluation): Reward {
  const woodId = run.design.woodId;
  const fine = fineMaterialBonus(
    run.brief.fee,
    woodId === null ? 1 : hammersFor(woodById(woodId)),
    FINE_WOOD_LABEL,
  );
  return settleTrendReward({
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
    extraLines: fine.lines,
    extraReputation: fine.reputation,
  });
}
