import { finishSpend } from "./finishing";
import { createFlipRun, type FlipPurpose, type FlipRun } from "./flipRun";
import type { Brief } from "./brief";
import type { GameState } from "./gameState";
import { rackSize } from "./rackPiece";
import { stallDayIssue } from "./stallCalendar";

export function runStartIssue(state: GameState): string | null {
  const run = state.activeRun;
  if (run !== null && run.stage !== "done") return "Finish or set aside the flip on your bench first.";
  return stallDayIssue(state.calendar.day);
}

function withNewRun(state: GameState, purpose: FlipPurpose, brief: Brief | null): GameState {
  const run: FlipRun = createFlipRun(`run-${state.next.run}`, purpose, brief, state.calendar.day);
  return { ...state, activeRun: run, next: { ...state.next, run: state.next.run + 1 } };
}

export function startFlip(state: GameState, gigId: string): GameState {
  const gig = state.gigs.active.find((entry) => entry.id === gigId);
  if (gig === undefined || runStartIssue(state) !== null) return state;
  return withNewRun(state, { kind: "gig", gigId }, gig.brief);
}

export function ownFlipIssue(state: GameState): string | null {
  const issue = runStartIssue(state);
  if (issue !== null) return issue;
  return state.rack.length >= rackSize(state.upgrades) ? "The stall rack is full until Stall Day." : null;
}

export function startOwnFlip(state: GameState): GameState {
  if (ownFlipIssue(state) !== null) return state;
  return withNewRun(state, { kind: "own" }, null);
}

export function abandonFlip(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  const refund = run.stage === "done" ? 0 : finishSpend(run);
  return {
    ...state,
    activeRun: null,
    coins: state.coins + refund,
    calendar: { ...state.calendar, marketOpen: false },
  };
}
