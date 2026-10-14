import { fineMaterialBonus } from "../../../engine/fineMaterial";
import { settleTrendReward, type TrendReward } from "../../../engine/trendReward";
import type { JewelTag } from "../content/jewelTag";
import type { Brief } from "./brief";
import { metalById } from "./catalog";
import type { GameState } from "./gameState";
import type { Evaluation } from "./pieceEvaluate";
import { pieceColours } from "./pieceColours";
import type { PieceRun } from "./pieceRun";
import { runSource } from "./pieceSource";
import { pieceTags } from "./pieceTags";

export type Reward = TrendReward<JewelTag>;

const REWARD_LABELS = { trend: "Arcade favourite", dreamer: "Starry ideas" } as const;

const FINE_METAL_LABEL = "Fine metal";

export function pieceReward(state: GameState, run: PieceRun, brief: Brief, evaluation: Evaluation): Reward {
  const source = runSource(run);
  const metalId = run.design.metalId;
  const fine = fineMaterialBonus(
    brief.fee,
    metalId === null ? 1 : metalById(metalId).sparkle,
    FINE_METAL_LABEL,
  );
  return settleTrendReward<JewelTag>({
    passed: evaluation.passed,
    score: evaluation.score,
    stars: evaluation.stars,
    fee: brief.fee,
    late: evaluation.criteria.some((criterion) => criterion.id === "deadline" && !criterion.passed),
    difficulty: state.profile.difficulty,
    trait: state.profile.trait,
    hotTags: state.trends.current,
    tags: pieceTags(source),
    colourCount: pieceColours(source).length,
    labels: REWARD_LABELS,
    extraLines: fine.lines,
    extraReputation: fine.reputation,
  });
}
