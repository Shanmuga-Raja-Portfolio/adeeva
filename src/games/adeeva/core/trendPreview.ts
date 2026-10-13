import type { StyleTag } from "../../../engine/styleTag";
import type { GameState } from "./gameState";

export function visibleNextTrends(state: GameState): readonly StyleTag[] | null {
  return state.profile.trait === "trendsetter" ? state.trends.next : null;
}
