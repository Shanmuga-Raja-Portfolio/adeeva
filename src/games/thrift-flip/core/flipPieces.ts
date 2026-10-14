import type { StyleTag } from "../../../engine/styleTag";
import type { RecipePiece, RecipeSeam } from "../content/recipe";
import { partById, recipeById } from "./catalog";
import { chosenParts, type Design } from "./design";

export function flipPieces(design: Design): RecipePiece[] {
  if (design.recipeId === null) return [];
  const recipe = recipeById(design.recipeId);
  const partPieces = chosenParts(design).flatMap((partId) => partById(partId)?.pieces ?? []);
  return [...recipe.pieces, ...partPieces];
}

export function flipSeams(design: Design): RecipeSeam[] {
  if (design.recipeId === null) return [];
  const recipe = recipeById(design.recipeId);
  const partSeams = chosenParts(design).flatMap((partId) => partById(partId)?.seams ?? []);
  return [...recipe.seams, ...partSeams];
}

export function designTags(design: Design): StyleTag[] {
  if (design.recipeId === null) return [];
  const recipe = recipeById(design.recipeId);
  const partTags = chosenParts(design).flatMap((partId) => partById(partId)?.tags ?? []);
  return [...recipe.tags, ...partTags];
}

export function flipPiece(design: Design, pieceId: string): RecipePiece | undefined {
  return flipPieces(design).find((piece) => piece.id === pieceId);
}
