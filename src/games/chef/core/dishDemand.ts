import { trendMatches } from "../../../engine/trendMarket";
import { CAREER, PATH_RULES } from "../content/career";
import type { DishId } from "../content/dish";
import type { TasteTag } from "../content/tasteTag";
import { dishById } from "./catalog";
import { cardFor } from "./dishDiary";
import type { GameState } from "./gameState";

export const TREND_APPEAL = 0.1;
export const EXPERT_APPEAL = 0.1;
export const STAR_APPEAL = 0.05;

export function dishAppeal(
  state: Pick<GameState, "trends" | "mastery" | "platingCards">,
  dishId: DishId,
  crowdTags: readonly TasteTag[] = [],
): number {
  const dish = dishById(dishId);
  const matches = trendMatches(dish.tags, state.trends.current).length;
  const expert = state.mastery[dish.cuisine] >= CAREER.expertMastery ? EXPERT_APPEAL : 0;
  const card = cardFor(state.platingCards, dishId);
  const stars = card === null ? 0 : STAR_APPEAL * (card.stars - 3);
  const crowd = dish.tags.filter((tag) => crowdTags.includes(tag)).length * PATH_RULES.crowdAppeal;
  return Math.round((1 + TREND_APPEAL * matches + expert + stars + crowd) * 1000) / 1000;
}
