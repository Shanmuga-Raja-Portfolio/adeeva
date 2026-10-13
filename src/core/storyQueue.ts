import { STORY_BEATS, type StoryBeatDef, type StoryTrigger } from "../content/storyBeat";
import { storyBeatById } from "./catalog";
import type { GameState } from "./gameState";

export function beatForTrigger(trigger: StoryTrigger): StoryBeatDef | undefined {
  return STORY_BEATS.find((beat) => beat.trigger === trigger);
}

export function queueStoryTrigger(state: GameState, trigger: StoryTrigger): GameState {
  const beat = beatForTrigger(trigger);
  if (beat === undefined) return state;
  const { story } = state;
  if (story.queue.includes(beat.id)) return state;
  if (!beat.repeatable && story.seen.includes(beat.id)) return state;
  return { ...state, story: { ...story, queue: [...story.queue, beat.id] } };
}

export function currentBeat(state: GameState): StoryBeatDef | null {
  const id = state.story.queue[0];
  return id === undefined ? null : (storyBeatById(id) ?? null);
}

export function markBeatSeen(state: GameState, beatId: string): GameState {
  const { story } = state;
  if (!story.queue.includes(beatId)) return state;
  const beat = storyBeatById(beatId);
  if (beat === undefined || beat.choices.length > 0) return state;
  return completeBeat(state, beatId, null);
}

export function completeBeat(state: GameState, beatId: string, flag: string | null): GameState {
  const { story } = state;
  const flags = flag === null || story.flags.includes(flag) ? story.flags : [...story.flags, flag];
  const seen = story.seen.includes(beatId) ? story.seen : [...story.seen, beatId];
  return { ...state, story: { seen, flags, queue: story.queue.filter((id) => id !== beatId) } };
}
