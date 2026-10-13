import type { DifficultyId } from "../../../engine/difficulty";
import { settleReward, type RewardCore, type RewardLine } from "../../../engine/reward";
import type { TraitId } from "../../../engine/trait";
import type { StyleTag } from "../content/styleTag";
import type { Brief } from "./brief";
import type { DressSnapshot } from "./dressSnapshot";
import type { Evaluation } from "./evaluate";
import { TREND_BUZZ_PER_MATCH, TREND_FEE_BONUS, trendMatches } from "./trendMarket";

export type { RewardLine, RewardOutcome } from "../../../engine/reward";

const DREAMER_FEE_BONUS = 0.15;
const DREAMER_COLOUR_COUNT = 3;
const DREAMER_TAGS: readonly StyleTag[] = ["dreamy", "bold"];
const TRENDSETTER_FEE_PER_MATCH = 0.1;

export interface Reward extends RewardCore {
  readonly trendMatches: readonly StyleTag[];
}

export interface RewardContext {
  readonly difficulty: DifficultyId;
  readonly trait: TraitId;
  readonly hotTags: readonly StyleTag[];
}

function dreamerBonusApplies(snapshot: DressSnapshot): boolean {
  return (
    snapshot.colours.length >= DREAMER_COLOUR_COUNT || snapshot.tags.some((tag) => DREAMER_TAGS.includes(tag))
  );
}

function isLate(evaluation: Evaluation): boolean {
  return evaluation.criteria.some((criterion) => criterion.id === "deadline" && !criterion.passed);
}

function bonusLines(
  fee: number,
  matches: readonly StyleTag[],
  snapshot: DressSnapshot,
  context: RewardContext,
): RewardLine[] {
  const lines: RewardLine[] = [];
  if (matches.length > 0) lines.push({ label: "Trend bonus", amount: Math.round(fee * TREND_FEE_BONUS) });
  if (context.trait === "trendsetter" && matches.length > 0)
    lines.push({
      label: "Trendsetter eye",
      amount: Math.round(fee * TRENDSETTER_FEE_PER_MATCH * matches.length),
    });
  if (context.trait === "dreamer" && dreamerBonusApplies(snapshot))
    lines.push({ label: "Dreamer flair", amount: Math.round(fee * DREAMER_FEE_BONUS) });
  return lines;
}

export function rewards(
  evaluation: Evaluation,
  brief: Brief,
  snapshot: DressSnapshot,
  context: RewardContext,
): Reward {
  const matches = trendMatches(snapshot.tags, context.hotTags);
  const core = settleReward({
    passed: evaluation.passed,
    score: evaluation.score,
    stars: evaluation.stars,
    fee: brief.fee,
    late: isLate(evaluation),
    difficulty: context.difficulty,
    trait: context.trait,
    bonusLines: bonusLines(brief.fee, matches, snapshot, context),
    extraBuzz: matches.length * TREND_BUZZ_PER_MATCH,
  });
  return {
    outcome: core.outcome,
    coins: core.coins,
    reputation: core.reputation,
    buzz: core.buzz,
    trendMatches: core.outcome === "pass" ? matches : [],
    lines: core.lines,
  };
}
