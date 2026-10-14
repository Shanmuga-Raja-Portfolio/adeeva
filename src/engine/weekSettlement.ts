import type { DifficultyId } from "./difficulty";
import type { RngState } from "./rng";
import { advanceTrendWeek, type TrendState } from "./trendMarket";

export type WeekTrigger = "first-week" | "bankrupt";

export interface WeekLedger<T extends string> {
  readonly coins: number;
  readonly trends: TrendState<T>;
  readonly rng: RngState;
  readonly profile: { readonly difficulty: DifficultyId };
}

export function settleWeek<T extends string, S extends WeekLedger<T>>(
  state: S,
  bill: number,
  pool: readonly T[],
  queue: (state: S, trigger: WeekTrigger) => S,
): S {
  const [trends, rng] = advanceTrendWeek(state.trends, state.rng, pool);
  const settled = queue({ ...state, coins: state.coins - bill, trends, rng }, "first-week");
  const bankrupt = settled.profile.difficulty === "challenging" && settled.coins < 0;
  return bankrupt ? queue(settled, "bankrupt") : settled;
}
