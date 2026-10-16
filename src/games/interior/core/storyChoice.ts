import { completeBeat, type StoryChoice } from "../../../engine/story";
import type { StoryEffect } from "../content/storyBeat";
import { storyBeatById } from "./catalog";
import type { GameState } from "./gameState";
import { canOpenLarkspur } from "./larkspurOffer";
import { openLarkspur } from "./openLarkspur";

export function storyChoiceIssue(state: GameState, choice: StoryChoice<StoryEffect>): string | null {
  return choice.effect === "open-larkspur" ? (canOpenLarkspur(state).reasons[0] ?? null) : null;
}

export function chooseStoryOption(state: GameState, beatId: string, choiceId: string): GameState {
  if (state.story.queue[0] !== beatId) return state;
  const choice = storyBeatById(beatId)?.choices.find((entry) => entry.id === choiceId);
  if (choice === undefined || storyChoiceIssue(state, choice) !== null) return state;
  const chosen: GameState = { ...state, story: completeBeat(state.story, beatId, choice.setsFlag) };
  return choice.effect === "open-larkspur" ? openLarkspur(chosen) : chosen;
}
