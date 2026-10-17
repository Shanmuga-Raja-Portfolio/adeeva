import { completeBeat, type StoryChoice } from "../../../engine/story";
import type { LineNameId } from "../content/lineName";
import type { StoryEffect } from "../content/storyBeat";
import { storyBeatById } from "./catalog";
import type { GameState } from "./gameState";
import { canOpenLoft, isLineNameId, openLoft } from "./loftOffer";

export function storyChoiceIssue(
  state: GameState,
  choice: StoryChoice<StoryEffect>,
  lineNameId: LineNameId | null,
): string | null {
  if (choice.effect !== "open-loft") return null;
  if (lineNameId === null || !isLineNameId(lineNameId)) return "Pick a name for your line first.";
  return canOpenLoft(state).reasons[0] ?? null;
}

export function chooseStoryOption(
  state: GameState,
  beatId: string,
  choiceId: string,
  lineNameId: LineNameId | null,
): GameState {
  if (state.story.queue[0] !== beatId) return state;
  const choice = storyBeatById(beatId)?.choices.find((entry) => entry.id === choiceId);
  if (choice === undefined || storyChoiceIssue(state, choice, lineNameId) !== null) return state;
  const chosen: GameState = { ...state, story: completeBeat(state.story, beatId, choice.setsFlag) };
  return choice.effect === "open-loft" && lineNameId !== null ? openLoft(chosen, lineNameId) : chosen;
}
