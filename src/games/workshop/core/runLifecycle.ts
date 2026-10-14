import { createRun } from "./commissionRun";
import type { GameState } from "./gameState";

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

export function setAside(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null || run.stage === "done") return state;
  return { ...state, activeRun: null };
}
