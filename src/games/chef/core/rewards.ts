import { SOFT_FAIL_FEE_SHARE } from "../../../engine/reward";
import { settleTrendReward, type TrendReward } from "../../../engine/trendReward";
import type { DishDef } from "../content/dish";
import type { TasteTag } from "../content/tasteTag";
import type { GameState } from "./gameState";

export type Reward = TrendReward<TasteTag>;

const REWARD_LABELS = { trend: "Town craving", dreamer: "Colour on the plate" } as const;
const STRONG_STARS = 4;
const GOOD_STARS = 3;

export interface RewardInput {
  readonly passed: boolean;
  readonly score: number;
  readonly stars: number;
  readonly fee: number;
  readonly late: boolean;
  readonly tags: readonly TasteTag[];
  readonly colourCount: number;
}

export function settleChefReward(state: Pick<GameState, "profile" | "trends">, input: RewardInput): Reward {
  return settleTrendReward<TasteTag>({
    ...input,
    difficulty: state.profile.difficulty,
    trait: state.profile.trait,
    hotTags: state.trends.current,
    labels: REWARD_LABELS,
  });
}

export function kindSoftFail(fee: number): Reward {
  const amount = Math.round(fee * SOFT_FAIL_FEE_SHARE);
  return {
    outcome: "soft-fail",
    coins: amount,
    reputation: 0,
    buzz: 0,
    lines: [{ label: "Part of the bonus", amount }],
    trendMatches: [],
  };
}

export function masteryGain(stars: number): number {
  if (stars >= STRONG_STARS) return 2;
  return stars >= GOOD_STARS ? 1 : 0;
}

export function dishTags(dishes: readonly DishDef[]): TasteTag[] {
  return [...new Set(dishes.flatMap((dish) => dish.tags))];
}
