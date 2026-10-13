import type { DifficultyId } from "../content/difficulty";
import type { StyleTag } from "../content/styleTag";
import type { TraitId } from "../content/trait";
import type { Brief } from "./brief";
import type { DressSnapshot } from "./dressSnapshot";
import type { Evaluation } from "./evaluate";
import { TREND_BUZZ_PER_MATCH, TREND_FEE_BONUS, trendMatches } from "./trendMarket";

const PASS_BASE_SHARE = 0.8;
const PASS_SCORE_SHARE = 0.4;
const DREAMER_FEE_BONUS = 0.15;
const DREAMER_COLOUR_COUNT = 3;
const DREAMER_TAGS: readonly StyleTag[] = ["dreamy", "bold"];
const CHARMER_TIP_SHARE = 0.1;
const TRENDSETTER_FEE_PER_MATCH = 0.1;
const LATE_PENALTY_SHARE: Readonly<Record<DifficultyId, number>> = {
  relaxed: 0,
  standard: 0,
  challenging: 0.5,
};
const SOFT_FAIL_FEE_SHARE = 0.4;
const SOFT_FAIL_REPUTATION = -1;
const HARD_FAIL_REPUTATION = -3;
const PASS_REPUTATION_MIN = 1;
const PASS_REPUTATION_RANGE = 2;

export type RewardOutcome = "pass" | "soft-fail" | "fail";

export interface RewardLine {
  readonly label: string;
  readonly amount: number;
}

export interface Reward {
  readonly outcome: RewardOutcome;
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
  readonly trendMatches: readonly StyleTag[];
  readonly lines: readonly RewardLine[];
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

function passReward(
  evaluation: Evaluation,
  brief: Brief,
  snapshot: DressSnapshot,
  context: RewardContext,
): Reward {
  const matches = trendMatches(snapshot.tags, context.hotTags);
  const fee = brief.fee;
  const lines: RewardLine[] = [
    {
      label: "Fee",
      amount: Math.round(fee * (PASS_BASE_SHARE + (PASS_SCORE_SHARE * evaluation.score) / 100)),
    },
  ];
  if (matches.length > 0) lines.push({ label: "Trend bonus", amount: Math.round(fee * TREND_FEE_BONUS) });
  if (context.trait === "trendsetter" && matches.length > 0)
    lines.push({
      label: "Trendsetter eye",
      amount: Math.round(fee * TRENDSETTER_FEE_PER_MATCH * matches.length),
    });
  if (context.trait === "dreamer" && dreamerBonusApplies(snapshot))
    lines.push({ label: "Dreamer flair", amount: Math.round(fee * DREAMER_FEE_BONUS) });
  if (context.trait === "charmer")
    lines.push({ label: "Charmer tip", amount: Math.round(fee * CHARMER_TIP_SHARE) });
  const latePenalty = isLate(evaluation) ? Math.round(fee * LATE_PENALTY_SHARE[context.difficulty]) : 0;
  if (latePenalty > 0) lines.push({ label: "Late delivery", amount: -latePenalty });
  const coins = Math.max(
    0,
    lines.reduce((sum, line) => sum + line.amount, 0),
  );
  const trendBuzz = matches.length * TREND_BUZZ_PER_MATCH;
  return {
    outcome: "pass",
    coins,
    reputation: PASS_REPUTATION_MIN + Math.round((PASS_REPUTATION_RANGE * evaluation.score) / 100),
    buzz: 1 + evaluation.stars + trendBuzz,
    trendMatches: matches,
    lines,
  };
}

export function rewards(
  evaluation: Evaluation,
  brief: Brief,
  snapshot: DressSnapshot,
  context: RewardContext,
): Reward {
  if (evaluation.passed || context.difficulty === "relaxed")
    return passReward(evaluation, brief, snapshot, context);
  if (context.difficulty === "standard") {
    const amount = Math.round(brief.fee * SOFT_FAIL_FEE_SHARE);
    return {
      outcome: "soft-fail",
      coins: amount,
      reputation: context.trait === "charmer" ? 0 : SOFT_FAIL_REPUTATION,
      buzz: 0,
      trendMatches: [],
      lines: [{ label: "Part of the fee", amount }],
    };
  }
  return {
    outcome: "fail",
    coins: 0,
    reputation: HARD_FAIL_REPUTATION,
    buzz: 0,
    trendMatches: [],
    lines: [],
  };
}
