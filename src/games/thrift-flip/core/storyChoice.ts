import { completeBeat } from "../../../engine/story";
import type { ShopSignId } from "../content/shopSign";
import { canOpenBoutique, openBoutique } from "./boutiqueUnlock";
import { storyBeatById } from "./catalog";
import type { GameState } from "./gameState";

export function chooseStoryOption(
  state: GameState,
  beatId: string,
  choiceId: string,
  signId: ShopSignId | null,
): GameState {
  if (state.story.queue[0] !== beatId) return state;
  const choice = storyBeatById(beatId)?.choices.find((entry) => entry.id === choiceId);
  if (choice === undefined) return state;
  const chosen = (next: GameState): GameState => ({
    ...next,
    story: completeBeat(next.story, beatId, choice.setsFlag),
  });
  if (choice.effect !== "open-boutique") return chosen(state);
  if (signId === null || !canOpenBoutique(state).ok) return state;
  const opened = openBoutique(state, signId);
  return opened === state ? state : chosen(opened);
}
