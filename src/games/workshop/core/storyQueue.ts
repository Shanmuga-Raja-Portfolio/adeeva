import { seeBeatWithBuzz } from "../../../engine/beatBuzz";
import { headBeatId, queueTrigger } from "../../../engine/story";
import { TRAIT_STORY_TRIGGERS, type TraitId } from "../../../engine/trait";
import { BEAT_BUZZ, STORY_BEATS, type StoryBeatDef, type StoryTrigger } from "../content/storyBeat";
import { storyBeatById } from "./catalog";
import type { GameState } from "./gameState";

export function queueStoryTrigger(state: GameState, trigger: StoryTrigger): GameState {
  const story = queueTrigger(state.story, STORY_BEATS, trigger);
  return story === state.story ? state : { ...state, story };
}

export function queueTraitBeat(state: GameState, trait: TraitId): GameState {
  return state.profile.trait === trait ? queueStoryTrigger(state, TRAIT_STORY_TRIGGERS[trait]) : state;
}

export function currentBeat(state: GameState): StoryBeatDef | null {
  const id = headBeatId(state.story);
  return id === null ? null : (storyBeatById(id) ?? null);
}

export function seeBeat(state: GameState, beatId: string): GameState {
  return seeBeatWithBuzz(state, beatId, storyBeatById, BEAT_BUZZ);
}
