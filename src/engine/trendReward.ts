import type { DifficultyId } from "./difficulty";
import { settleReward, type RewardCore, type RewardLine } from "./reward";
import type { StyleTag } from "./styleTag";
import type { TraitId } from "./trait";
import { TREND_BUZZ_PER_MATCH, TREND_FEE_BONUS, trendMatches } from "./trendMarket";

const DREAMER_FEE_BONUS = 0.15;
const DREAMER_COLOUR_COUNT = 3;
const DREAMER_TAGS: ReadonlySet<string> = new Set<StyleTag>(["dreamy", "bold"]);
const TRENDSETTER_FEE_PER_MATCH = 0.1;

export interface TrendReward<T extends string = StyleTag> extends RewardCore {
  readonly trendMatches: readonly T[];
}

export interface TrendRewardLabels {
  readonly trend: string;
  readonly dreamer: string;
}

const DEFAULT_LABELS: TrendRewardLabels = { trend: "Trend bonus", dreamer: "Dreamer flair" };

export interface TrendRewardTerms<T extends string = StyleTag> {
  readonly passed: boolean;
  readonly score: number;
  readonly stars: number;
  readonly fee: number;
  readonly late: boolean;
  readonly difficulty: DifficultyId;
  readonly trait: TraitId;
  readonly hotTags: readonly T[];
  readonly tags: readonly T[];
  readonly colourCount: number;
  readonly labels?: TrendRewardLabels | undefined;
  readonly extraBuzz?: number | undefined;
  readonly extraLines?: readonly RewardLine[] | undefined;
}

export function dreamerFlair(colourCount: number, tags: readonly string[]): boolean {
  return colourCount >= DREAMER_COLOUR_COUNT || tags.some((tag) => DREAMER_TAGS.has(tag));
}

function bonusLines<T extends string>(terms: TrendRewardTerms<T>, matches: number): RewardLine[] {
  const { fee, trait } = terms;
  const labels = terms.labels ?? DEFAULT_LABELS;
  const lines: RewardLine[] = [];
  if (matches > 0) lines.push({ label: labels.trend, amount: Math.round(fee * TREND_FEE_BONUS) });
  if (trait === "trendsetter" && matches > 0)
    lines.push({ label: "Trendsetter eye", amount: Math.round(fee * TRENDSETTER_FEE_PER_MATCH * matches) });
  if (trait === "dreamer" && dreamerFlair(terms.colourCount, terms.tags))
    lines.push({ label: labels.dreamer, amount: Math.round(fee * DREAMER_FEE_BONUS) });
  return [...lines, ...(terms.extraLines ?? [])];
}

export function settleTrendReward<T extends string>(terms: TrendRewardTerms<T>): TrendReward<T> {
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
    extraBuzz: matches.length * TREND_BUZZ_PER_MATCH + (terms.extraBuzz ?? 0),
  });
  return { ...core, trendMatches: core.outcome === "pass" ? matches : [] };
}
