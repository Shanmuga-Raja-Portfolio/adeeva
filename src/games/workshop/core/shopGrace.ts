import type { GameState } from "./gameState";
import { queueStoryTrigger } from "./storyQueue";

export const SHOP_GRACE_COINS = 60;

export function shopGraceDue(state: GameState): boolean {
  const showroom = state.showroom;
  return (
    state.career === "showroom" &&
    showroom !== null &&
    state.profile.difficulty === "standard" &&
    state.coins < 0 &&
    showroom.graceSeason < showroom.seasonNumber
  );
}

export function applyShopGrace(state: GameState): GameState {
  const showroom = state.showroom;
  if (showroom === null || !shopGraceDue(state)) return state;
  const helped: GameState = {
    ...state,
    coins: state.coins + SHOP_GRACE_COINS,
    showroom: { ...showroom, graceSeason: showroom.seasonNumber },
  };
  return queueStoryTrigger(helped, "tight-season");
}
