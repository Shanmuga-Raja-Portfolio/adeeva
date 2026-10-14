import { completeBeat as completeStoryBeat } from "../../../engine/story";
import { headBeat, queueStateTrigger } from "../../../engine/storyQueue";
import { STORY_BEATS, type StoryBeatDef, type StoryTrigger } from "../content/storyBeat";
import { storyBeatById } from "./catalog";
import type { GameState } from "./gameState";

export function queueStoryTrigger(state: GameState, trigger: StoryTrigger): GameState {
  return queueStateTrigger(state, STORY_BEATS, trigger);
}

export function currentBeat(state: GameState): StoryBeatDef | null {
  return headBeat(state.story, storyBeatById);
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
