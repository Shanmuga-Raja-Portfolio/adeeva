import { ownEntry } from "./ownEntry";
import { applyStanding, type Standing } from "./standing";
import { markBeatSeen, type StoryState } from "./story";

export function seeBeatWithBuzz<S extends Standing & { readonly story: StoryState }>(
  state: S,
  beatId: string,
  lookup: (beatId: string) => unknown,
  beatBuzz: Readonly<Record<string, number>>,
): S {
  const firstTime = !state.story.seen.includes(beatId);
  const seen = markBeatSeen(state, beatId, lookup);
  const buzz = ownEntry(beatBuzz, beatId) ?? 0;
  if (seen === state || !firstTime || buzz === 0) return seen;
  return applyStanding(seen, { coins: 0, reputation: 0, buzz });
}
