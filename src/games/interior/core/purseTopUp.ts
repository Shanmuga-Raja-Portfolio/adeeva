import type { GameState } from "./gameState";
import { isHomeRoom } from "./makeoverRun";
import { openProject, withProject } from "./projectUpdate";
import { purseLeft } from "./purse";
import { cartCost, planShortfall } from "./warehouse";

export const TOP_UP_STEP = 10;

export function topUpIssue(state: GameState): string | null {
  const project = openProject(state);
  if (project === null || project.stage === "done") return "There is no home project to top up.";
  const run = state.activeRun;
  if (run !== null && isHomeRoom(run) && run.stage === "shop") {
    const needed = cartCost(state, planShortfall(state, run));
    if (purseLeft(project) >= needed) return "The purse already covers this plan.";
  }
  if (state.coins < TOP_UP_STEP) return `Topping up needs ${TOP_UP_STEP} coins.`;
  return null;
}

export function topUpPurse(state: GameState): GameState {
  if (topUpIssue(state) !== null) return state;
  return withProject({ ...state, coins: state.coins - TOP_UP_STEP }, (project) => ({
    ...project,
    added: project.added + TOP_UP_STEP,
  }));
}
