import type { Brief } from "./brief";
import { ticketById } from "./catalog";
import { finishSpend } from "./finishing";
import { createFlipRun, type FlipPurpose, type FlipRun } from "./flipRun";
import type { GameState } from "./gameState";
import { hallClosedIssue } from "./hallDay";
import { rackIsFull } from "./rackRoom";
import { stallDayIssue } from "./stallCalendar";
import { lentFind } from "./ticketBrief";

export function runStartIssue(state: GameState): string | null {
  const run = state.activeRun;
  if (run !== null && run.stage !== "done") return "Finish or set aside the flip on your bench first.";
  return stallDayIssue(state.calendar.day) ?? hallClosedIssue(state);
}

function withNewRun(state: GameState, purpose: FlipPurpose, brief: Brief | null): GameState {
  const created: FlipRun = createFlipRun(`run-${state.next.run}`, purpose, brief, state.calendar.day);
  const ticketId = brief?.ticketId ?? null;
  const run =
    ticketId === null || purpose.kind !== "gig"
      ? created
      : { ...created, finds: [lentFind(purpose.gigId, ticketById(ticketId))] };
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
  if (!rackIsFull(state)) return null;
  return state.profile.career === "boutique"
    ? "The seasonal rack is full until Till Day."
    : "The stall rack is full until Stall Day.";
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
