import { isCount } from "../../../engine/count";
import { sameList } from "../../../engine/sameList";
import { PATH_RULES } from "../content/career";
import type { DishId } from "../content/dish";
import { dishById, isDishId } from "./catalog";
import type { GameState } from "./gameState";
import { isDishUnlocked } from "./mastery";
import { withPath, type MenuDish, type PathState } from "./path";
import { menuDish } from "./pathStart";
import { menuPortions } from "./menuPortions";
import { isFairPrice, priceRange } from "./special";

type MenuPath = Extract<PathState, { readonly menu: readonly MenuDish[] }>;

function menuPath(state: GameState): MenuPath | null {
  const path = state.path;
  return path !== null && path.kind !== "tv" ? path : null;
}

function openNow(path: MenuPath): boolean {
  return path.kind === "restaurant" ? path.tonight !== null : path.today !== null;
}

function shapeIssues(path: MenuPath, dishIds: readonly DishId[]): string[] {
  const issues: string[] = [];
  if (path.kind === "truck") {
    if (dishIds.length !== PATH_RULES.truckMenu)
      issues.push(`Pick ${PATH_RULES.truckMenu} dishes for the hatch.`);
    return issues;
  }
  if (dishIds.length < PATH_RULES.menuMin || dishIds.length > PATH_RULES.menuMax)
    issues.push(`Pick ${PATH_RULES.menuMin} to ${PATH_RULES.menuMax} dishes.`);
  const dishes = dishIds.map(dishById);
  if (new Set(dishes.map((dish) => dish.cuisine)).size < PATH_RULES.menuCuisines)
    issues.push(`Guests love variety: use at least ${PATH_RULES.menuCuisines} kitchens.`);
  if (new Set(dishes.flatMap((dish) => dish.tags)).size < PATH_RULES.menuTags)
    issues.push(`Guests love variety: aim for at least ${PATH_RULES.menuTags} different tastes.`);
  return issues;
}

export function pathMenuIssues(state: GameState, dishIds: readonly string[]): string[] {
  const path = menuPath(state);
  if (path === null) return ["There is no menu to write here."];
  if (!Array.isArray(dishIds) || dishIds.some((id) => !isDishId(id))) return ["Pick dishes from the list."];
  const known = dishIds.filter(isDishId);
  const issues: string[] = [];
  if (openNow(path)) issues.push("Finish tonight's service first.");
  if (new Set(known).size !== known.length) issues.push("Pick each dish once.");
  if (known.some((id) => !isDishUnlocked(state.mastery, dishById(id))))
    issues.push("Pick dishes you have unlocked.");
  return [...issues, ...shapeIssues(path, known)];
}

export function menuReady(state: GameState): string | null {
  const path = menuPath(state);
  if (path === null) return "There is no menu here.";
  return (
    pathMenuIssues(
      state,
      path.menu.map((entry) => entry.dishId),
    )[0] ?? null
  );
}

function evenSplit(count: number): number[] {
  return Array.from(
    { length: count },
    (_, index) => Math.floor(PATH_RULES.fridge / count) + (index < PATH_RULES.fridge % count ? 1 : 0),
  );
}

export function setPathMenu(state: GameState, dishIds: readonly string[]): GameState {
  const path = menuPath(state);
  if (path === null || pathMenuIssues(state, dishIds).length > 0) return state;
  const known = dishIds.filter(isDishId);
  if (
    sameList(
      known,
      path.menu.map((entry) => entry.dishId),
    )
  )
    return state;
  const split = evenSplit(known.length);
  const menu = known.map((dishId, index) => {
    const kept = path.menu.find((entry) => entry.dishId === dishId);
    if (path.kind === "truck") return { ...(kept ?? menuDish(dishId, 0)), par: split[index] ?? 0 };
    return kept ?? menuDish(dishId, PATH_RULES.defaultPar);
  });
  return withPath(state, { ...path, menu });
}

export function priceIssue(state: GameState, dishId: string, price: number): string | null {
  const path = menuPath(state);
  if (path === null || !isDishId(dishId)) return "That dish is not on the menu.";
  if (!path.menu.some((entry) => entry.dishId === dishId)) return "That dish is not on the menu.";
  if (openNow(path)) return "Finish tonight's service first.";
  if (isFairPrice(dishId, price)) return null;
  const [low, high] = priceRange(dishId);
  return `Set a price from ${low} to ${high}.`;
}

export function setPrice(state: GameState, dishId: string, price: number): GameState {
  const path = menuPath(state);
  if (path === null || priceIssue(state, dishId, price) !== null) return state;
  const entry = path.menu.find((item) => item.dishId === dishId);
  if (entry === undefined || entry.price === price) return state;
  const menu = path.menu.map((item) => (item.dishId === dishId ? { ...item, price } : item));
  return withPath(state, { ...path, menu });
}

export function parLimit(path: MenuPath, dishId: DishId): number {
  if (path.kind === "restaurant") return PATH_RULES.parMax;
  const others = menuPortions(path.menu.filter((entry) => entry.dishId !== dishId));
  return Math.max(0, PATH_RULES.fridge - others);
}

export function parIssue(state: GameState, dishId: string, count: number): string | null {
  const path = menuPath(state);
  if (path === null || !isDishId(dishId) || !path.menu.some((entry) => entry.dishId === dishId))
    return "That dish is not on the menu.";
  if (openNow(path)) return "Finish tonight's service first.";
  const limit = parLimit(path, dishId);
  if (!isCount(count) || count > limit)
    return path.kind === "truck"
      ? `The fridge holds ${PATH_RULES.fridge} portions in all.`
      : `Get ready from 0 to ${limit} portions.`;
  return null;
}

export function setPar(state: GameState, dishId: string, count: number): GameState {
  const path = menuPath(state);
  if (path === null || parIssue(state, dishId, count) !== null) return state;
  const entry = path.menu.find((item) => item.dishId === dishId);
  if (entry === undefined || entry.par === count) return state;
  const menu = path.menu.map((item) => (item.dishId === dishId ? { ...item, par: count } : item));
  return withPath(state, { ...path, menu });
}
