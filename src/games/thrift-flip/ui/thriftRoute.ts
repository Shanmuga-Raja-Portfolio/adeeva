import { isStallDay, type GameState } from "../core";
import type { SaveSlotId } from "./thriftSlots";

export type PlayView = "hub" | "flip" | "stall";

export type AppRoute =
  | { readonly name: "title" }
  | { readonly name: "newGame"; readonly slot: SaveSlotId }
  | { readonly name: "play"; readonly view: PlayView };

export type ResolvedScreen =
  | { readonly name: "title" }
  | { readonly name: "newGame"; readonly slot: SaveSlotId }
  | { readonly name: "hub"; readonly game: GameState }
  | { readonly name: "flip"; readonly game: GameState }
  | { readonly name: "stall"; readonly game: GameState };

export function resolveScreen(route: AppRoute, game: GameState | null): ResolvedScreen {
  if (route.name === "newGame") return route;
  if (route.name === "title" || game === null) return { name: "title" };
  if (route.view === "flip" && game.activeRun !== null) return { name: "flip", game };
  if (route.view === "stall" && isStallDay(game.calendar.day)) return { name: "stall", game };
  return { name: "hub", game };
}
