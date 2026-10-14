import type { StyleTag } from "./styleTag";
import type { RngState } from "./rng";
import { drawDistinct } from "./rngDraw";
import type { TraitId } from "./trait";

export const HOT_TAGS_PER_WEEK = 2;
export const TREND_FEE_BONUS = 0.1;
export const TREND_BUZZ_PER_MATCH = 3;

export interface TrendState<T extends string = StyleTag> {
  readonly current: readonly T[];
  readonly next: readonly T[];
}

export function rollHotTags<T extends string>(rng: RngState, pool: readonly T[]): [T[], RngState] {
  return drawDistinct(rng, pool, HOT_TAGS_PER_WEEK);
}

export function rollTrendState<T extends string>(
  rng: RngState,
  pool: readonly T[],
): [TrendState<T>, RngState] {
  const [current, afterCurrent] = rollHotTags(rng, pool);
  const [next, afterNext] = rollHotTags(afterCurrent, pool);
  return [{ current, next }, afterNext];
}

export function advanceTrendWeek<T extends string>(
  trends: TrendState<T>,
  rng: RngState,
  pool: readonly T[],
): [TrendState<T>, RngState] {
  const [next, after] = rollHotTags(rng, pool);
  return [{ current: trends.next, next }, after];
}

export function trendMatches<T extends string>(tags: readonly T[], hotTags: readonly T[]): T[] {
  return hotTags.filter((tag) => tags.includes(tag));
}

export function visibleNextTrends<T extends string>(state: {
  readonly profile: { readonly trait: TraitId };
  readonly trends: TrendState<T>;
}): readonly T[] | null {
  return state.profile.trait === "trendsetter" ? state.trends.next : null;
}
