import type { GameState } from "./gameState";
import { isHomeRoom, type MakeoverRun } from "./makeoverRun";
import { openProject, withProject } from "./projectUpdate";
import { changeStock, shortfallOf, type Cart, type Stock } from "./stock";

export function roomStock(state: Pick<GameState, "stock" | "larkspur">, run: MakeoverRun): Stock {
  const project = openProject(state);
  return isHomeRoom(run) && project !== null ? changeStock(state.stock, project.shelf, 1) : state.stock;
}

export function addGoods(state: GameState, run: MakeoverRun, cart: Cart): GameState {
  const project = openProject(state);
  if (!isHomeRoom(run) || project === null) return { ...state, stock: changeStock(state.stock, cart, 1) };
  return withProject(state, (current) => ({ ...current, shelf: changeStock(current.shelf, cart, 1) }));
}

export function takeGoods(state: GameState, run: MakeoverRun, cart: Cart): GameState {
  const project = openProject(state);
  if (!isHomeRoom(run) || project === null) return { ...state, stock: changeStock(state.stock, cart, -1) };
  const fromStock = shortfallOf(project.shelf, cart);
  const shelf = changeStock(changeStock(project.shelf, cart, -1), fromStock, 1);
  return withProject({ ...state, stock: changeStock(state.stock, fromStock, -1) }, (current) => ({
    ...current,
    shelf,
  }));
}
