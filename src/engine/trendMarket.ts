import { STYLE_TAGS, type StyleTag } from "./styleTag";
import type { RngState } from "./rng";
import { drawDistinct } from "./rngDraw";
import type { TraitId } from "./trait";

export const HOT_TAGS_PER_WEEK = 2;
export const TREND_FEE_BONUS = 0.1;
export const TREND_BUZZ_PER_MATCH = 3;

export interface TrendState {
  readonly current: readonly StyleTag[];
  readonly next: readonly StyleTag[];
}

export function rollHotTags(rng: RngState): [StyleTag[], RngState] {
  return drawDistinct(rng, STYLE_TAGS, HOT_TAGS_PER_WEEK);
}

export function rollTrendState(rng: RngState): [TrendState, RngState] {
  const [current, afterCurrent] = rollHotTags(rng);
  const [next, afterNext] = rollHotTags(afterCurrent);
  return [{ current, next }, afterNext];
}

export function advanceTrendWeek(trends: TrendState, rng: RngState): [TrendState, RngState] {
  const [next, after] = rollHotTags(rng);
  return [{ current: trends.next, next }, after];
}

export function trendMatches(tags: readonly StyleTag[], hotTags: readonly StyleTag[]): StyleTag[] {
  return hotTags.filter((tag) => tags.includes(tag));
}

export function visibleNextTrends(state: {
  readonly profile: { readonly trait: TraitId };
  readonly trends: TrendState;
}): readonly StyleTag[] | null {
  return state.profile.trait === "trendsetter" ? state.trends.next : null;
}
