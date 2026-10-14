import { canOpenMarket, type GameState } from "../core";
import type { SaveSlotId } from "./jewellerySlots";

export type PlayView = "hub" | "bench" | "market" | "keepsakes";

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
  if (route.view === "bench" && game.activeRun !== null) return { name: "bench", game };
  if (route.view === "market" && (canOpenMarket(game).ok || game.market.shownDay === game.calendar.day))
    return { name: "market", game };
  if (route.view === "keepsakes") return { name: "keepsakes", game };
  return { name: "hub", game };
}
