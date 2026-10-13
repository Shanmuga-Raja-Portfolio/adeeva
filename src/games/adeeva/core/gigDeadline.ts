import { lapseOverdue } from "../../../engine/gigBoard";
import { applyStanding } from "../../../engine/standing";
import type { GameState } from "./gameState";

export function lapseOverdueGigs(state: GameState): GameState {
  const lapse = lapseOverdue(state.gigs, state.calendar.day, state.profile.difficulty, state.profile.trait);
  if (lapse === null) return state;
  const run = state.activeRun;
  const runLapsed = run !== null && run.purpose.kind === "gig" && lapse.lapsedIds.has(run.purpose.gigId);
  const updated: GameState = { ...state, activeRun: runLapsed ? null : run, gigs: lapse.board };
  return applyStanding(updated, { coins: 0, reputation: lapse.reputation, buzz: 0 });
}
