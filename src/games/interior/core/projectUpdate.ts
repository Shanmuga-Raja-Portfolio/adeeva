import type { GameState } from "./gameState";
import type { Larkspur, Project } from "./larkspur";

export function openProject(state: Pick<GameState, "larkspur">): Project | null {
  return state.larkspur?.project ?? null;
}

export function withLarkspur(state: GameState, change: (larkspur: Larkspur) => Larkspur | null): GameState {
  const larkspur = state.larkspur;
  if (larkspur === null) return state;
  const next = change(larkspur);
  return next === null || next === larkspur ? state : { ...state, larkspur: next };
}

export function withProject(
  state: GameState,
  change: (project: Project, larkspur: Larkspur) => Project | null,
): GameState {
  return withLarkspur(state, (larkspur) => {
    const project = larkspur.project;
    if (project === null) return null;
    const next = change(project, larkspur);
    return next === null || next === project ? null : { ...larkspur, project: next };
  });
}
