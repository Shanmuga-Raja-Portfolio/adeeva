import { RECIPES, type PartGroup, type RecipeDef, type RecipeId } from "../content/recipe";
import { recipeById } from "./catalog";

export interface Design {
  readonly recipeId: RecipeId | null;
  readonly parts: Readonly<Record<string, string>>;
}

export const EMPTY_DESIGN: Design = { recipeId: null, parts: {} };

export function chosenParts(design: Design): string[] {
  if (design.recipeId === null) return [];
  return recipeById(design.recipeId).partGroups.flatMap((group) => {
    const partId = design.parts[group.id];
    return partId === undefined ? [] : [partId];
  });
}

export function missingGroups(design: Design): PartGroup[] {
  if (design.recipeId === null) return [];
  return recipeById(design.recipeId).partGroups.filter((group) => design.parts[group.id] === undefined);
}

export function isDesignComplete(design: Design): boolean {
  return design.recipeId !== null && missingGroups(design).length === 0;
}

export function designIssues(design: Design): string[] {
  if (design.recipeId === null) return ["Pick something to make."];
  return missingGroups(design).map((group) => `Choose the ${group.label.toLowerCase()}.`);
}

export function fitKey(design: Design): string | null {
  if (design.recipeId === null || !isDesignComplete(design)) return null;
  const parts = chosenParts(design);
  return parts.length === 0 ? design.recipeId : `${design.recipeId}:${parts.join("+")}`;
}

function combinations(groups: readonly PartGroup[]): string[][] {
  return groups.reduce<string[][]>(
    (combos, group) => combos.flatMap((combo) => group.partIds.map((partId) => [...combo, partId])),
    [[]],
  );
}

export function recipeFitKeys(recipe: RecipeDef): string[] {
  return combinations(recipe.partGroups).map((parts) =>
    parts.length === 0 ? recipe.id : `${recipe.id}:${parts.join("+")}`,
  );
}

export const ALL_FIT_KEYS: readonly string[] = RECIPES.flatMap(recipeFitKeys);

export function designFor(key: string): Design {
  const [recipeId, partList] = key.split(":");
  const recipe = RECIPES.find((entry) => entry.id === recipeId);
  if (recipe === undefined) return EMPTY_DESIGN;
  const partIds = partList === undefined ? [] : partList.split("+");
  const parts = Object.fromEntries(
    recipe.partGroups.flatMap((group, index) => {
      const partId = partIds[index];
      return partId === undefined ? [] : [[group.id, partId]];
    }),
  );
  return { recipeId: recipe.id, parts };
}
