import { seeBeatWithBuzz } from "../../../engine/beatBuzz";
import { headBeat, queueStateTraitBeat, queueStateTrigger } from "../../../engine/storyQueue";
import type { TraitId } from "../../../engine/trait";
import { BEAT_BUZZ, STORY_BEATS, type StoryBeatDef, type StoryTrigger } from "../content/storyBeat";
import { storyBeatById } from "./catalog";
import type { GameState } from "./gameState";

export function queueStoryTrigger(state: GameState, trigger: StoryTrigger): GameState {
  return queueStateTrigger(state, STORY_BEATS, trigger);
}

export function queueTraitBeat(state: GameState, trait: TraitId): GameState {
  return queueStateTraitBeat(state, STORY_BEATS, trait);
}

export function currentBeat(state: GameState): StoryBeatDef | null {
  return headBeat(state.story, storyBeatById);
}

export function seeBeat(state: GameState, beatId: string): GameState {
  if ((storyBeatById(beatId)?.choices.length ?? 0) > 0) return state;
  return seeBeatWithBuzz(state, beatId, storyBeatById, BEAT_BUZZ);
}
