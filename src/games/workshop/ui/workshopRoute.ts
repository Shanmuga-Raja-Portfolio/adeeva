import type { GameState } from "../core";
import type { SaveSlotId } from "./workshopSlots";

export type PlayView = "hub" | "build" | "fair" | "floor";

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
  if (route.view === "build" && game.activeRun !== null) return { name: "build", game };
  if (route.view === "fair" && game.fair !== null && game.showroom !== null) return { name: "fair", game };
  if (route.view === "floor" && game.showroom !== null) return { name: "floor", game };
  return { name: "hub", game };
}
