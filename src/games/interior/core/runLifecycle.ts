import { setAsideActiveRun } from "../../../engine/activeRunUpdate";
import { drawSeed } from "../../../engine/rngDraw";
import type { GameState } from "./gameState";
import { createMakeoverRun } from "./makeoverRun";

export function runStartIssue(state: GameState): string | null {
  const run = state.activeRun;
  if (run !== null && run.stage !== "done") return "Finish or set aside the room you are working on first.";
  return null;
}

export function startOrder(state: GameState, gigId: string): GameState {
  const gig = state.gigs.active.find((entry) => entry.id === gigId);
  if (gig === undefined || runStartIssue(state) !== null) return state;
  const [seed, rng] = drawSeed(state.rng);
  const run = createMakeoverRun({
    id: `run-${state.nextRunNumber}`,
    gigId,
    brief: gig.brief,
    day: state.calendar.day,
    seed,
  });
  return { ...state, rng, activeRun: run, nextRunNumber: state.nextRunNumber + 1 };
}

export function abandonRun(state: GameState): GameState {
  return setAsideActiveRun(state);
}
