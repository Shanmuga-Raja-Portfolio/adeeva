import { setAsideActiveRun } from "../../../engine/activeRunUpdate";
import { drawSeed } from "../../../engine/rngDraw";
import { HOME_HINTS } from "../content/hints";
import type { GameState } from "./gameState";
import { createMakeoverRun, EMPTY_PLAN, isHomeRoom, MAKEOVER } from "./makeoverRun";

export function runStartIssue(state: GameState): string | null {
  const run = state.activeRun;
  if (run !== null && isHomeRoom(run)) return HOME_HINTS.homeRoomOpen;
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
    purpose: MAKEOVER,
    plan: EMPTY_PLAN,
    day: state.calendar.day,
    seed,
  });
  return { ...state, rng, activeRun: run, nextRunNumber: state.nextRunNumber + 1 };
}

export function abandonRun(state: GameState): GameState {
  if (state.activeRun !== null && isHomeRoom(state.activeRun)) return state;
  return setAsideActiveRun(state);
}
