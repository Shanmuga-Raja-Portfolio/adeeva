import { createRun } from "./commissionRun";
import type { GameState } from "./gameState";

export const SET_LOCKED = "Finish the set first.";

export function runStartIssue(state: GameState): string | null {
  const run = state.activeRun;
  if (run !== null && run.stage !== "done") return "Finish or set aside the piece on the workbench first.";
  return null;
}

export function startCommission(state: GameState, gigId: string): GameState {
  const gig = state.gigs.active.find((entry) => entry.id === gigId);
  if (gig === undefined || runStartIssue(state) !== null) return state;
  const run = createRun(`run-${state.nextRunNumber}`, gig.id, gig.brief, state.calendar.day);
  return { ...state, activeRun: run, nextRunNumber: state.nextRunNumber + 1 };
}

export function setAsideIssue(state: GameState): string | null {
  const run = state.activeRun;
  if (run === null || run.stage === "done") return "Nothing on the workbench.";
  if (run.purpose.kind === "set" && Object.keys(run.cuts).length > 0) return SET_LOCKED;
  return null;
}

export function setAside(state: GameState): GameState {
  return setAsideIssue(state) === null ? { ...state, activeRun: null } : state;
}
