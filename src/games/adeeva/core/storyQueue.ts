import { completeBeat as completeStoryBeat, headBeatId, queueTrigger } from "../../../engine/story";
import { STORY_BEATS, type StoryBeatDef, type StoryTrigger } from "../content/storyBeat";
import { storyBeatById } from "./catalog";
import type { GameState } from "./gameState";

export function queueStoryTrigger(state: GameState, trigger: StoryTrigger): GameState {
  const story = queueTrigger(state.story, STORY_BEATS, trigger);
  return story === state.story ? state : { ...state, story };
}

export function currentBeat(state: GameState): StoryBeatDef | null {
  const id = headBeatId(state.story);
  return id === null ? null : (storyBeatById(id) ?? null);
}

export function markBeatSeen(state: GameState, beatId: string): GameState {
  if (!state.story.queue.includes(beatId)) return state;
  const beat = storyBeatById(beatId);
  if (beat === undefined || beat.choices.length > 0) return state;
  return completeBeat(state, beatId, null);
}

export function completeBeat(state: GameState, beatId: string, flag: string | null): GameState {
  return { ...state, story: completeStoryBeat(state.story, beatId, flag) };
}
