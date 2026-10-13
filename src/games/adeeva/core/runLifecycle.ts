import { themeBrief } from "./brief";
import { createDressRun, type DressRun } from "./dressRun";
import type { GameState } from "./gameState";
import { LOOKS_PER_SEASON, seasonTheme } from "./labelSeason";
import { seasonMinQuality } from "./seasonMinQuality";

export function runStartIssue(state: GameState): string | null {
  const run = state.activeRun;
  if (run !== null && run.stage !== "done") return "Finish or set aside the dress on the table first.";
  return null;
}

function withNewRun(state: GameState, create: (id: string) => DressRun): GameState {
  const id = `run-${state.nextRunNumber}`;
  return { ...state, activeRun: create(id), nextRunNumber: state.nextRunNumber + 1 };
}

export function startRun(state: GameState, gigId: string): GameState {
  const gig = state.gigs.active.find((entry) => entry.id === gigId);
  if (gig === undefined || runStartIssue(state) !== null) return state;
  return withNewRun(state, (id) => createDressRun(id, { kind: "gig", gigId }, gig.brief, state.calendar.day));
}

export function lookStartIssue(state: GameState, lookIndex: number): string | null {
  const season = state.season;
  if (season === null) return "There is no show this season.";
  if (season.result !== null) return "This season's show is over.";
  if (!Number.isInteger(lookIndex) || lookIndex < 0 || lookIndex >= LOOKS_PER_SEASON)
    return "That look slot does not exist.";
  if (season.looks[lookIndex] !== null) return "That look is already finished.";
  return runStartIssue(state);
}

export function startLook(state: GameState, lookIndex: number): GameState {
  const season = state.season;
  if (season === null || lookStartIssue(state, lookIndex) !== null) return state;
  const brief = themeBrief(seasonTheme(season), season.deadlineDay, seasonMinQuality(state, season));
  return withNewRun(state, (id) =>
    createDressRun(id, { kind: "look", lookIndex }, brief, state.calendar.day),
  );
}

export function abandonRun(state: GameState): GameState {
  if (state.activeRun === null) return state;
  return { ...state, activeRun: null };
}
