import type { GameState } from "./gameState";
import type { Project } from "./larkspur";
import { openProject, withProject } from "./projectUpdate";

export function purseLeft(project: Pick<Project, "purse" | "added" | "spent">): number {
  return project.purse + project.added - project.spent;
}

export function spendPurse(state: GameState, cost: number): GameState | null {
  const project = openProject(state);
  if (project === null || cost < 0) return null;
  const short = Math.max(0, cost - purseLeft(project));
  if (short > 0 && state.profile.difficulty !== "relaxed") return null;
  if (cost === 0) return state;
  return withProject(state, (current) => ({
    ...current,
    added: current.added + short,
    spent: current.spent + cost,
  }));
}
