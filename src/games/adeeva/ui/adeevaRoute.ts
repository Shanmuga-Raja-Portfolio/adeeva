import type { GameState } from "../core";
import type { SaveSlotId } from "./adeevaSlots";

export type PlayView = "hub" | "craft" | "label";

export type AppRoute =
  | { readonly name: "title" }
  | { readonly name: "newGame"; readonly slot: SaveSlotId }
  | { readonly name: "play"; readonly view: PlayView };

export type ResolvedScreen =
  | { readonly name: "title" }
  | { readonly name: "newGame"; readonly slot: SaveSlotId }
  | { readonly name: "hub"; readonly game: GameState }
  | { readonly name: "craft"; readonly game: GameState }
  | { readonly name: "label"; readonly game: GameState };

export function resolveScreen(route: AppRoute, game: GameState | null): ResolvedScreen {
  if (route.name === "newGame") return route;
  if (route.name === "title" || game === null) return { name: "title" };
  if (route.view === "craft" && game.activeRun !== null) return { name: "craft", game };
  if (route.view === "label" && game.profile.career === "label" && game.season !== null)
    return { name: "label", game };
  return { name: "hub", game };
}
