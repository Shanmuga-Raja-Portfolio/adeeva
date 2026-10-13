import type { DifficultyId } from "../content/difficulty";
import type { TraitId } from "../content/trait";
import type { GameState, Gig, LapsedGig } from "./gameState";
import { applyStanding } from "./standing";

export const LATE_GRACE_DAYS = 3;

export function isGigLate(gig: Gig, day: number): boolean {
  return day > gig.brief.deadlineDay;
}

export function gigLapseDay(gig: Gig): number {
  return gig.brief.deadlineDay + LATE_GRACE_DAYS + 1;
}

export function lapseReputation(difficulty: DifficultyId, trait: TraitId): number {
  if (difficulty === "challenging") return -3;
  if (difficulty === "standard") return trait === "charmer" ? 0 : -1;
  return 0;
}

export function lapseOverdueGigs(state: GameState): GameState {
  if (state.profile.difficulty === "relaxed") return state;
  const day = state.calendar.day;
  const overdue = state.gigs.active.filter((gig) => day >= gigLapseDay(gig));
  if (overdue.length === 0) return state;
  const reputation = lapseReputation(state.profile.difficulty, state.profile.trait);
  const lapsed: LapsedGig[] = overdue.map((gig) => ({
    gigId: gig.id,
    clientId: gig.clientId,
    day,
    reputation,
  }));
  const overdueIds = new Set(overdue.map((gig) => gig.id));
  const run = state.activeRun;
  const runLapsed = run !== null && run.purpose.kind === "gig" && overdueIds.has(run.purpose.gigId);
  const updated: GameState = {
    ...state,
    activeRun: runLapsed ? null : run,
    gigs: {
      ...state.gigs,
      active: state.gigs.active.filter((gig) => !overdueIds.has(gig.id)),
      lapsed: [...state.gigs.lapsed, ...lapsed],
    },
  };
  return applyStanding(updated, { coins: 0, reputation: reputation * overdue.length, buzz: 0 });
}
