import { seeBeatWithBuzz } from "../../../engine/beatBuzz";
import { headBeatId, queueTrigger } from "../../../engine/story";
import { TRAIT_STORY_TRIGGERS, type TraitId } from "../../../engine/trait";
import { BEAT_BUZZ, STORY_BEATS, type StoryBeatDef, type StoryTrigger } from "../content/storyBeat";
import { storyBeatById } from "./catalog";
import type { GameState } from "./gameState";

const TRAIT_FOLLOW_UPS: Partial<Record<StoryTrigger, TraitId>> = {
  "first-week": "trendsetter",
  "first-delivery": "charmer",
};

function queueOne(state: GameState, trigger: StoryTrigger): GameState {
  const story = queueTrigger(state.story, STORY_BEATS, trigger);
  return story === state.story ? state : { ...state, story };
}

export function queueTraitBeat(state: GameState, trait: TraitId): GameState {
  return state.profile.trait === trait ? queueOne(state, TRAIT_STORY_TRIGGERS[trait]) : state;
}

export function queueStoryTrigger(state: GameState, trigger: StoryTrigger): GameState {
  const queued = queueOne(state, trigger);
  const followUp = TRAIT_FOLLOW_UPS[trigger];
  return followUp === undefined ? queued : queueTraitBeat(queued, followUp);
}

export function currentBeat(state: GameState): StoryBeatDef | null {
  const id = headBeatId(state.story);
  return id === null ? null : (storyBeatById(id) ?? null);
}

export function seeBeat(state: GameState, beatId: string): GameState {
  return seeBeatWithBuzz(state, beatId, storyBeatById, BEAT_BUZZ);
}
