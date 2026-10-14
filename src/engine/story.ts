import type { TraitId } from "./trait";

export interface StoryState {
  readonly seen: readonly string[];
  readonly flags: readonly string[];
  readonly queue: readonly string[];
}

export type StoryLine =
  | { readonly kind: "spoken"; readonly speaker: string; readonly text: string }
  | {
      readonly kind: "player";
      readonly text: string;
      readonly byTrait: Partial<Readonly<Record<TraitId, string>>>;
    };

export interface StoryChoice<E extends string> {
  readonly id: string;
  readonly label: string;
  readonly setsFlag: string;
  readonly effect: E | null;
}

export interface StoryBeat<T extends string, E extends string> {
  readonly id: string;
  readonly trigger: T;
  readonly title: string;
  readonly repeatable: boolean;
  readonly lines: readonly StoryLine[];
  readonly choices: readonly StoryChoice<E>[];
}

export function queueTrigger<T extends string, E extends string>(
  story: StoryState,
  beats: readonly StoryBeat<T, E>[],
  trigger: T,
): StoryState {
  const beat = beats.find((entry) => entry.trigger === trigger);
  if (beat === undefined) return story;
  if (story.queue.includes(beat.id)) return story;
  if (!beat.repeatable && story.seen.includes(beat.id)) return story;
  return { ...story, queue: [...story.queue, beat.id] };
}

export function headBeatId(story: StoryState): string | null {
  return story.queue[0] ?? null;
}

export function completeBeat(story: StoryState, beatId: string, flag: string | null): StoryState {
  const flags = flag === null || story.flags.includes(flag) ? story.flags : [...story.flags, flag];
  const seen = story.seen.includes(beatId) ? story.seen : [...story.seen, beatId];
  return { seen, flags, queue: story.queue.filter((id) => id !== beatId) };
}

export function markBeatSeen<S extends { readonly story: StoryState }>(
  state: S,
  beatId: string,
  lookup: (beatId: string) => unknown,
): S {
  if (!state.story.queue.includes(beatId) || lookup(beatId) === undefined) return state;
  return { ...state, story: completeBeat(state.story, beatId, null) };
}
