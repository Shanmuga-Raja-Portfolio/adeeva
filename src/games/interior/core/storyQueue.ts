import { seeBeatWithBuzz } from "../../../engine/beatBuzz";
import { headBeat, queueStateTraitBeat, queueTriggerWithFollowUp } from "../../../engine/storyQueue";
import type { TraitId } from "../../../engine/trait";
import { BEAT_BUZZ, STORY_BEATS, type StoryBeatDef, type StoryTrigger } from "../content/storyBeat";
import { storyBeatById } from "./catalog";
import type { GameState } from "./gameState";

const TRAIT_FOLLOW_UPS: Partial<Readonly<Record<StoryTrigger, TraitId>>> = {
  "first-week": "trendsetter",
  "first-delivery": "charmer",
};

export function queueTraitBeat(state: GameState, trait: TraitId): GameState {
  return queueStateTraitBeat(state, STORY_BEATS, trait);
}

export function queueStoryTrigger(state: GameState, trigger: StoryTrigger): GameState {
  return queueTriggerWithFollowUp(state, STORY_BEATS, trigger, TRAIT_FOLLOW_UPS);
}

export function currentBeat(state: GameState): StoryBeatDef | null {
  return headBeat(state.story, storyBeatById);
}

export function seeBeat(state: GameState, beatId: string): GameState {
  if ((storyBeatById(beatId)?.choices.length ?? 0) > 0) return state;
  return seeBeatWithBuzz(state, beatId, storyBeatById, BEAT_BUZZ);
}
