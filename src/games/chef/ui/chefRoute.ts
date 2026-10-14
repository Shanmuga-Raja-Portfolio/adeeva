import { crossroadsOpen, type GameState } from "../core";
import type { SaveSlotId } from "./chefSlots";

export type PlayView = "hub" | "dish" | "service" | "diary" | "crossroads";

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
  if (route.view === "dish" && game.activeRun !== null) return { name: "dish", game };
  if (
    route.view === "service" &&
    (game.service !== null || game.log.some((entry) => entry.kind === "service"))
  )
    return { name: "service", game };
  if (route.view === "diary") return { name: "diary", game };
  if (route.view === "crossroads" && crossroadsOpen(game)) return { name: "crossroads", game };
  return { name: "hub", game };
}
