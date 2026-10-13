import { completeBeat, headBeatId, queueTrigger } from "../../../engine/story";
import type { TraitId } from "../../../engine/trait";
import { STORY_BEATS, type StoryBeatDef, type StoryTrigger } from "../content/storyBeat";
import { storyBeatById } from "./catalog";
import type { GameState } from "./gameState";

const TRAIT_TRIGGERS: Readonly<Record<TraitId, StoryTrigger>> = {
  dreamer: "trait-dreamer",
  perfectionist: "trait-perfectionist",
  trendsetter: "trait-trendsetter",
  charmer: "trait-charmer",
};

export function queueStoryTrigger(state: GameState, trigger: StoryTrigger): GameState {
  const story = queueTrigger(state.story, STORY_BEATS, trigger);
  return story === state.story ? state : { ...state, story };
}

export function queueTraitBeat(state: GameState, trait: TraitId): GameState {
  return state.profile.trait === trait ? queueStoryTrigger(state, TRAIT_TRIGGERS[trait]) : state;
}

export function currentBeat(state: GameState): StoryBeatDef | null {
  const id = headBeatId(state.story);
  return id === null ? null : (storyBeatById(id) ?? null);
}

export function markBeatSeen(state: GameState, beatId: string): GameState {
  if (!state.story.queue.includes(beatId) || storyBeatById(beatId) === undefined) return state;
  return { ...state, story: completeBeat(state.story, beatId, null) };
}
