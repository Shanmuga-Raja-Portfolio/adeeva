import { isShowcaseDay, isStallDay, todaysSwapDay, type GameState } from "../core";
import type { SaveSlotId } from "./thriftSlots";

export type PlayView = "hub" | "flip" | "stall" | "window" | "hall" | "showcase";

export type AppRoute =
  | { readonly name: "title" }
  | { readonly name: "newGame"; readonly slot: SaveSlotId }
  | { readonly name: "play"; readonly view: PlayView };

export type ResolvedScreen =
  | { readonly name: "title" }
  | { readonly name: "newGame"; readonly slot: SaveSlotId }
  | { readonly name: "hub"; readonly game: GameState }
  | { readonly name: "flip"; readonly game: GameState }
  | { readonly name: "stall"; readonly game: GameState }
  | { readonly name: "window"; readonly game: GameState }
  | { readonly name: "hall"; readonly game: GameState }
  | { readonly name: "showcase"; readonly game: GameState };

function showcaseOpen(game: GameState): boolean {
  const showcase = game.boutique?.season.showcase ?? null;
  return showcase === null ? isShowcaseDay(game) : showcase.day === game.calendar.day;
}

export function resolveScreen(route: AppRoute, game: GameState | null): ResolvedScreen {
  if (route.name === "newGame") return route;
  if (route.name === "title" || game === null) return { name: "title" };
  if (route.view === "flip" && game.activeRun !== null) return { name: "flip", game };
  if (route.view === "stall" && isStallDay(game.calendar.day)) return { name: "stall", game };
  if (route.view === "window" && game.boutique !== null) return { name: "window", game };
  if (route.view === "hall" && todaysSwapDay(game) !== null && !isStallDay(game.calendar.day))
    return { name: "hall", game };
  if (route.view === "showcase" && game.boutique !== null && showcaseOpen(game))
    return { name: "showcase", game };
  return { name: "hub", game };
}
