import { visibleNextTrends } from "../../../engine/trendMarket";
import type { FindId } from "../content/find";
import { findById } from "./catalog";
import type { GameState } from "./gameState";

export function hotMarker(state: GameState, findId: FindId): boolean {
  const next = visibleNextTrends(state);
  return next !== null && findById(findId).tags.some((tag) => next.includes(tag));
}
