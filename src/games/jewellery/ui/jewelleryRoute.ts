import {
  canOpenMarket,
  launchDayKind,
  launchReady,
  launchStaged,
  lookbookCollection,
  seasonDayOf,
  BOARD_LAST_SEASON_DAY,
  type GameState,
} from "../core";
import type { SaveSlotId } from "./jewellerySlots";

export type PlayView =
  "hub" | "bench" | "market" | "keepsakes" | "board" | "gems" | "lookbook" | "launch" | "popup";

export type AppRoute =
  | { readonly name: "title" }
  | { readonly name: "newGame"; readonly slot: SaveSlotId }
  | { readonly name: "play"; readonly view: PlayView };

export type ResolvedScreen =
  | { readonly name: "title" }
  | { readonly name: "newGame"; readonly slot: SaveSlotId }
  | { readonly name: PlayView; readonly game: GameState };

function boardOpen(game: GameState): boolean {
  const collection = game.collection;
  if (collection === null || collection.themeId === null || collection.brief !== null) return false;
  const day = seasonDayOf(collection, game.calendar.day);
  return day !== null && day <= BOARD_LAST_SEASON_DAY && !collection.rested;
}

function gemsOpen(game: GameState): boolean {
  const collection = game.collection;
  return collection !== null && collection.gemTray.length > 0 && collection.gemSpent === null;
}

function lookbookOpen(game: GameState): boolean {
  const collection = game.collection;
  return lookbookCollection(game) !== null || (collection !== null && collection.lookbook.pages.length > 0);
}

function launchOpen(game: GameState): boolean {
  const collection = game.collection;
  if (collection === null) return false;
  return launchStaged(game, collection) || (launchDayKind(game) !== null && launchReady(game, collection));
}

function popupOpen(game: GameState): boolean {
  const collection = game.collection;
  return collection !== null && launchDayKind(game) === "late" && launchStaged(game, collection);
}

const VIEW_OPEN: Readonly<Partial<Record<PlayView, (game: GameState) => boolean>>> = {
  bench: (game) => game.activeRun !== null,
  market: (game) => canOpenMarket(game).ok || game.market.shownDay === game.calendar.day,
  keepsakes: () => true,
  board: boardOpen,
  gems: gemsOpen,
  lookbook: lookbookOpen,
  launch: launchOpen,
  popup: popupOpen,
};

export function resolveScreen(route: AppRoute, game: GameState | null): ResolvedScreen {
  if (route.name === "newGame") return route;
  if (route.name === "title" || game === null) return { name: "title" };
  const open = VIEW_OPEN[route.view];
  if (open !== undefined && open(game)) return { name: route.view, game };
  return { name: "hub", game };
}
