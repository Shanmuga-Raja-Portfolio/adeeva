import type { GameState } from "./gameState";
import { queueStoryTrigger } from "./storyQueue";

export const KEPT_MILESTONES = [
  { count: 50, trigger: "kept-50" },
  { count: 100, trigger: "kept-100" },
] as const;

export function addKept(state: GameState, count: number): GameState {
  if (count <= 0) return state;
  const kept = { ...state, keptInUse: state.keptInUse + count };
  if (kept.profile.career !== "boutique") return kept;
  return KEPT_MILESTONES.reduce(
    (next, milestone) =>
      next.keptInUse >= milestone.count ? queueStoryTrigger(next, milestone.trigger) : next,
    kept,
  );
}
