import type { DifficultyId } from "./difficulty";
import { settleReward, type RewardCore, type RewardLine } from "./reward";
import type { StyleTag } from "./styleTag";
import type { TraitId } from "./trait";
import { TREND_BUZZ_PER_MATCH, TREND_FEE_BONUS, trendMatches } from "./trendMarket";

const DREAMER_FEE_BONUS = 0.15;
const DREAMER_COLOUR_COUNT = 3;
const DREAMER_TAGS: readonly StyleTag[] = ["dreamy", "bold"];
const TRENDSETTER_FEE_PER_MATCH = 0.1;

export interface TrendReward extends RewardCore {
  readonly trendMatches: readonly StyleTag[];
}

export interface TrendRewardTerms {
  readonly passed: boolean;
  readonly score: number;
  readonly stars: number;
  readonly fee: number;
  readonly late: boolean;
  readonly difficulty: DifficultyId;
  readonly trait: TraitId;
  readonly hotTags: readonly StyleTag[];
  readonly tags: readonly StyleTag[];
  readonly colourCount: number;
}

export function dreamerFlair(colourCount: number, tags: readonly StyleTag[]): boolean {
  return colourCount >= DREAMER_COLOUR_COUNT || tags.some((tag) => DREAMER_TAGS.includes(tag));
}

function bonusLines(terms: TrendRewardTerms, matches: number): RewardLine[] {
  const { fee, trait } = terms;
  const lines: RewardLine[] = [];
  if (matches > 0) lines.push({ label: "Trend bonus", amount: Math.round(fee * TREND_FEE_BONUS) });
  if (trait === "trendsetter" && matches > 0)
    lines.push({ label: "Trendsetter eye", amount: Math.round(fee * TRENDSETTER_FEE_PER_MATCH * matches) });
  if (trait === "dreamer" && dreamerFlair(terms.colourCount, terms.tags))
    lines.push({ label: "Dreamer flair", amount: Math.round(fee * DREAMER_FEE_BONUS) });
  return lines;
}

export function settleTrendReward(terms: TrendRewardTerms): TrendReward {
  const matches = trendMatches(terms.tags, terms.hotTags);
  const core = settleReward({
    passed: terms.passed,
    score: terms.score,
    stars: terms.stars,
    fee: terms.fee,
    late: terms.late,
    difficulty: terms.difficulty,
    trait: terms.trait,
    bonusLines: bonusLines(terms, matches.length),
    extraBuzz: matches.length * TREND_BUZZ_PER_MATCH,
  });
  return { ...core, trendMatches: core.outcome === "pass" ? matches : [] };
}
