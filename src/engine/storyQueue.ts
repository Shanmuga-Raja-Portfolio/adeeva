import { ownEntry } from "./ownEntry";
import { headBeatId, queueTrigger, type StoryBeat, type StoryState } from "./story";
import { TRAIT_STORY_TRIGGERS, type TraitId } from "./trait";

type Beats = readonly StoryBeat<string, string>[];

interface Storied {
  readonly story: StoryState;
}

interface TraitStoried extends Storied {
  readonly profile: { readonly trait: TraitId };
}

type TraitFollowUps = Partial<Readonly<Record<string, TraitId>>>;

export function queueStateTrigger<S extends Storied>(state: S, beats: Beats, trigger: string): S {
  const story = queueTrigger(state.story, beats, trigger);
  return story === state.story ? state : { ...state, story };
}

export function queueStateTraitBeat<S extends TraitStoried>(state: S, beats: Beats, trait: TraitId): S {
  return state.profile.trait === trait ? queueStateTrigger(state, beats, TRAIT_STORY_TRIGGERS[trait]) : state;
}

export function queueTriggerWithFollowUp<S extends TraitStoried>(
  state: S,
  beats: Beats,
  trigger: string,
  followUps: TraitFollowUps,
): S {
  const queued = queueStateTrigger(state, beats, trigger);
  const followUp = ownEntry(followUps, trigger);
  return followUp === undefined ? queued : queueStateTraitBeat(queued, beats, followUp);
}

export function headBeat<B>(story: StoryState, beatById: (beatId: string) => B | undefined): B | null {
  const id = headBeatId(story);
  return id === null ? null : (beatById(id) ?? null);
}
