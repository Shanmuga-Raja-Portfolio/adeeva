import { PATH_RULES } from "../content/career";
import type { PathId } from "../content/path";
import type { StoryTrigger } from "../content/storyBeat";
import { isPathId, nameCardById, pathById } from "./catalog";
import { rollDayBoard } from "./dayBoardRoll";
import type { GameState } from "./gameState";
import { createPath } from "./pathStart";
import { queueStoryTrigger } from "./storyQueue";

const START_BEATS: Readonly<Record<PathId, StoryTrigger>> = {
  restaurant: "restaurant-start",
  truck: "truck-start",
  tv: "tv-start",
};

export function crossroadsGoals(state: GameState): string[] {
  const goals: string[] = [];
  if (state.rung !== "head") goals.push("Become head chef at the Hall.");
  if (state.reputation < PATH_RULES.crossroadsReputation)
    goals.push(`Reach reputation ${PATH_RULES.crossroadsReputation}.`);
  if (state.passes.head < PATH_RULES.crossroadsPasses)
    goals.push(
      `Pass ${PATH_RULES.crossroadsPasses} head-chef services or private orders (${state.passes.head} so far).`,
    );
  return goals;
}

export function crossroadsOpen(state: GameState): boolean {
  return state.path === null && crossroadsGoals(state).length === 0;
}

export function pathStartCost(state: Pick<GameState, "profile">, path: PathId): number {
  const cost = pathById(path).startCost;
  return state.profile.difficulty === "relaxed" ? Math.round(cost * PATH_RULES.relaxedCostShare) : cost;
}

function busyReason(state: GameState): string | null {
  if (state.service !== null) return "Finish the service first.";
  if (state.activeRun !== null && state.activeRun.stage !== "done")
    return "Finish the dish on the board first.";
  return state.testDay === null ? null : "Finish today's test first.";
}

export function peekIssue(state: GameState, path: string): string | null {
  if (!isPathId(path)) return "That door is not here.";
  if (state.path !== null) return "You have already chosen your path.";
  if (!crossroadsOpen(state)) return "The Crossroads opens when you are ready.";
  return state.peeked.includes(path) ? "You have already peeked through this door." : null;
}

export function peekPath(state: GameState, path: string): GameState {
  if (!isPathId(path) || peekIssue(state, path) !== null) return state;
  return { ...state, peeked: [...state.peeked, path] };
}

export function choosePathIssues(state: GameState, path: string, nameCard: string | null): string[] {
  if (!isPathId(path)) return ["That door is not here."];
  const issues: string[] = [];
  if (state.path !== null) issues.push("You have already chosen your path.");
  else if (!crossroadsOpen(state)) issues.push(...crossroadsGoals(state));
  const busy = busyReason(state);
  if (busy !== null) issues.push(busy);
  const cost = pathStartCost(state, path);
  if (state.coins < cost) issues.push(`This door needs ${cost} coins saved. You have ${state.coins}.`);
  if (path === "restaurant" && (nameCard === null || nameCardById(nameCard) === undefined))
    issues.push("Pick a name card for the door.");
  if (path !== "restaurant" && nameCard !== null) issues.push("Only a restaurant needs a name card.");
  return issues;
}

export function choosePath(state: GameState, path: string, nameCard: string | null): GameState {
  if (!isPathId(path) || choosePathIssues(state, path, nameCard).length > 0) return state;
  const [created, rng] = createPath(state, path, nameCard ?? "", state.rng);
  const chosen: GameState = {
    ...state,
    coins: state.coins - pathStartCost(state, path),
    path: created,
    rng,
  };
  return queueStoryTrigger(rollDayBoard(chosen), START_BEATS[path]);
}

export function previewPath(state: GameState, path: PathId): GameState {
  const [created] = createPath(state, path, "own-table", state.rng);
  return rollDayBoard({ ...state, path: created });
}

export function withCrossroadsBeat(state: GameState): GameState {
  return crossroadsOpen(state) ? queueStoryTrigger(state, "crossroads") : state;
}
