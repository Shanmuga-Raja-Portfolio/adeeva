import { GRACE_COINS, graceDue } from "../../../engine/seasonGrace";
import type { GameState } from "./gameState";
import { queueStoryTrigger } from "./storyQueue";

export const SHOP_GRACE_COINS = GRACE_COINS;

export function shopGraceDue(state: GameState): boolean {
  const showroom = state.showroom;
  return (
    state.career === "showroom" &&
    showroom !== null &&
    graceDue({
      difficulty: state.profile.difficulty,
      coins: state.coins,
      graceSeason: showroom.graceSeason,
      seasonNumber: showroom.seasonNumber,
    })
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
