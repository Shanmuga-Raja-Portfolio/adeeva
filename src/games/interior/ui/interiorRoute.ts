import type { GameState } from "../core";
import type { SaveSlotId } from "./interiorSlots";

export type PlayView = "hub" | "makeover" | "home" | "openHouse";

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
  if (route.view === "makeover" && game.activeRun !== null) return { name: "makeover", game };
  if (route.view === "home" && (game.larkspur?.project ?? null) !== null) return { name: "home", game };
  if (route.view === "openHouse" && (game.larkspur?.history.length ?? 0) > 0)
    return { name: "openHouse", game };
  return { name: "hub", game };
}
