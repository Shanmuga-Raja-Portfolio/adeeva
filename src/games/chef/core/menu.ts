import { CAREER } from "../content/career";
import { dishById, isDishId } from "./catalog";
import type { GameState } from "./gameState";
import { isDishUnlocked } from "./mastery";
import { queueStoryTrigger } from "./storyQueue";

export function menuIssues(state: GameState, dishIds: readonly string[]): string[] {
  if (!Array.isArray(dishIds)) return ["Pick dishes from the list."];
  const issues: string[] = [];
  if (state.rung !== "head") issues.push("The head chef writes the menu.");
  if (state.service !== null) issues.push("Finish the service first.");
  if (dishIds.length !== CAREER.menuSize || new Set(dishIds).size !== dishIds.length)
    issues.push(`Pick ${CAREER.menuSize} different dishes.`);
  if (dishIds.some((id) => !isDishId(id) || !isDishUnlocked(state.mastery, dishById(id))))
    issues.push("Pick dishes you have unlocked.");
  return issues;
}

export function setMenu(state: GameState, dishIds: readonly string[]): GameState {
  if (menuIssues(state, dishIds).length > 0) return state;
  const menu = dishIds.filter(isDishId);
  if (menu.length === state.menu.length && menu.every((id, index) => state.menu[index] === id)) return state;
  return queueStoryTrigger({ ...state, menu }, "first-menu-written");
}

export function setGuide(state: GameState, on: boolean): GameState {
  if (typeof on !== "boolean" || state.guide === on) return state;
  return { ...state, guide: on };
}
