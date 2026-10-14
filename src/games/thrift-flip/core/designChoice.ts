import type { RecipeId } from "../content/recipe";
import { designBriefIssue } from "./brief";
import { isRecipeId, recipeById } from "./catalog";
import type { Design } from "./design";
import { findBlockIssue } from "./findChoice";
import type { FlipRun } from "./flipRun";
import type { GameState } from "./gameState";
import { withPlacements } from "./runPlacements";
import { updateRun } from "./runUpdate";

function withDesign(run: FlipRun, design: Design): FlipRun {
  const finds = run.finds.filter((owned) => findBlockIssue(design, owned) === null);
  return { ...withPlacements(run, {}), design, finds, autoLaid: false };
}

export function recipeChoiceIssue(run: FlipRun, recipeId: RecipeId): string | null {
  if (!isRecipeId(recipeId)) return "That is not something we can make yet.";
  return designBriefIssue(run.brief, { recipeId, parts: {} });
}

export function chooseRecipe(state: GameState, recipeId: RecipeId): GameState {
  return updateRun(state, "design", (run) => {
    if (recipeChoiceIssue(run, recipeId) !== null || run.design.recipeId === recipeId) return null;
    return withDesign(run, { recipeId, parts: {} });
  });
}

export function partChoiceIssue(run: FlipRun, groupId: string, partId: string): string | null {
  if (run.design.recipeId === null) return "Pick something to make first.";
  const group = recipeById(run.design.recipeId).partGroups.find((entry) => entry.id === groupId);
  if (group === undefined || !group.partIds.includes(partId)) return "That shape doesn't fit this piece.";
  return designBriefIssue(run.brief, { ...run.design, parts: { [groupId]: partId } });
}

export function choosePart(state: GameState, groupId: string, partId: string): GameState {
  return updateRun(state, "design", (run) => {
    if (partChoiceIssue(run, groupId, partId) !== null || run.design.parts[groupId] === partId) return null;
    return withDesign(run, { ...run.design, parts: { ...run.design.parts, [groupId]: partId } });
  });
}
