import { GRACE_COINS, graceDue } from "../../../engine/seasonGrace";
import type { GameState } from "./gameState";
import { loftCollection } from "./seasonCalendar";
import { queueStoryTrigger } from "./storyQueue";

export function loftGraceDue(state: GameState): boolean {
  const collection = loftCollection(state);
  return (
    collection !== null &&
    graceDue({
      difficulty: state.profile.difficulty,
      coins: state.coins,
      graceSeason: collection.graceSeason,
      seasonNumber: collection.seasonNumber,
    })
  );
}

export function applyLoftGrace(state: GameState): GameState {
  const collection = loftCollection(state);
  if (collection === null || !loftGraceDue(state)) return state;
  const helped: GameState = {
    ...state,
    coins: state.coins + GRACE_COINS,
    collection: { ...collection, graceSeason: collection.seasonNumber },
  };
  return queueStoryTrigger(helped, "tight-season");
}
