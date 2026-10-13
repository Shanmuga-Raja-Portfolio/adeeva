import type { GameState } from "../core";
import type { SaveSlotId } from "./patisserieSlots";

export type PlayView = "hub" | "bake" | "counter" | "book";

export type AppRoute =
  | { readonly name: "title" }
  | { readonly name: "newGame"; readonly slot: SaveSlotId }
  | { readonly name: "play"; readonly view: PlayView };

export type ResolvedScreen =
  | { readonly name: "title" }
  | { readonly name: "newGame"; readonly slot: SaveSlotId }
  | { readonly name: PlayView; readonly game: GameState };

export function resolveScreen(route: AppRoute, game: GameState | null): ResolvedScreen {
  if (route.name === "newGame") return route;
  if (route.name === "title" || game === null) return { name: "title" };
  if (route.view === "bake" && game.activeRun !== null) return { name: "bake", game };
  if (route.view === "counter" && game.counter.session !== null) return { name: "counter", game };
  if (route.view === "book") return { name: "book", game };
  return { name: "hub", game };
}
