import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { spendHours } from "../../../engine/dayHours";
import { applyStanding } from "../../../engine/standing";
import type { LaunchThemeDef } from "../content/launchTheme";
import { PRICE_TAG_IDS, type PriceTagId } from "../content/priceTag";
import { launchThemeById, priceTagById } from "./catalog";
import type { CollectionPiece, CollectionState } from "./collectionState";
import { copyRequestCount, copyRequestsFor, mostLoved, type HeartTally } from "./copyRequests";
import type { GameState } from "./gameState";
import { atLeast } from "./lanternGarland";
import type { LaunchResult, PopupEntry, ShelfSale } from "./launchState";
import { launchStaged, popupDone } from "./launchStatus";
import { addToDrawer } from "./lineDrawer";
import { fitsTheme, marketPieces, salePrice, withoutDrawerPieces } from "./marketDay";
import { popupHearts } from "./popupHearts";
import { fairPrice, sells, tagPrice } from "./popupPrice";
import { saleTraitLines } from "./saleTraitLines";
import { isPopupDay, loftCollection } from "./seasonCalendar";
import { queueStoryTrigger } from "./storyQueue";

export const POPUP_HOURS = 3;
export const MAX_SHELF = 2;
const SHELF_MARK = 35;

export interface PopupChoice {
  readonly plinth: string;
  readonly tags: Readonly<Record<string, PriceTagId>>;
  readonly shelf: readonly string[];
}

export interface PopupBoardRow {
  readonly piece: CollectionPiece;
  readonly hearts: number;
  readonly fair: number;
}

function popupCollection(state: GameState): CollectionState | null {
  const collection = loftCollection(state);
  if (collection === null || !isPopupDay(state, state.calendar.day)) return null;
  if (!launchStaged(state, collection) || popupDone(state, collection)) return null;
  return collection;
}

function launchResult(state: GameState): LaunchResult | null {
  return state.launch?.result ?? null;
}

export function launchedPieces(collection: CollectionState, result: LaunchResult): CollectionPiece[] {
  return result.plan.order.flatMap((id) => collection.pieces.filter((piece) => piece.id === id));
}

function pageLightOf(collection: CollectionState, pieceId: string): number {
  return collection.lookbook.pages.find((page) => page.pieceId === pieceId)?.light ?? 0;
}

export function appealOf(collection: CollectionState, piece: CollectionPiece, theme: LaunchThemeDef): number {
  return piece.quality + 20 * (fitsTheme(piece, theme) ? 1 : 0) + 20 * pageLightOf(collection, piece.id);
}

export function popupBoard(state: GameState, plinth: string): PopupBoardRow[] {
  const collection = loftCollection(state);
  const result = launchResult(state);
  if (collection === null || result === null) return [];
  const theme = launchThemeById(result.themeId);
  const pieces = launchedPieces(collection, result);
  const hearts = popupHearts(
    pieces.map((piece) => ({ id: piece.id, appeal: appealOf(collection, piece, theme) })),
    result.overall,
    state.upgrades.includes("window-stands"),
    plinth,
  );
  const harmony = result.panels.find((panel) => panel.id === "harmony")?.score ?? 0;
  const terms = { harmony, silverOrBetter: atLeast(result.award, "silver-lantern") };
  return pieces.map((piece) => ({ piece, hearts: hearts.get(piece.id) ?? 1, fair: fairPrice(piece, terms) }));
}

export function shelfSells(state: GameState): boolean {
  const overall = launchResult(state)?.overall ?? 0;
  return state.profile.difficulty === "relaxed" || overall >= SHELF_MARK;
}

export function canOpenPopup(state: GameState, choice: PopupChoice): ActionCheck {
  const collection = popupCollection(state);
  const result = launchResult(state);
  if (collection === null || result === null)
    return actionCheck(["The Pop-up Window opens the day after Lantern Night."]);
  const ids = launchedPieces(collection, result).map((piece) => piece.id);
  if (!ids.includes(choice.plinth)) return actionCheck(["Pick a piece for the window plinth."]);
  const tagged = ids.every((id) => {
    const tag = choice.tags[id];
    return tag !== undefined && PRICE_TAG_IDS.includes(tag);
  });
  if (!tagged) return actionCheck(["Give every piece a price tag."]);
  if (Object.keys(choice.tags).some((id) => !ids.includes(id)))
    return actionCheck(["Tag only the line's pieces."]);
  const extras = marketPieces(state).map((piece) => piece.id);
  if (
    choice.shelf.length > MAX_SHELF ||
    new Set(choice.shelf).size !== choice.shelf.length ||
    !choice.shelf.every((id) => extras.includes(id))
  )
    return actionCheck([`The Little shelf holds up to ${MAX_SHELF} pieces.`]);
  if (state.calendar.hoursLeft < POPUP_HOURS) return actionCheck(["The Pop-up Window takes 3 hours."]);
  return actionCheck([]);
}

function entriesFor(state: GameState, rows: readonly PopupBoardRow[], choice: PopupChoice): PopupEntry[] {
  const relaxed = state.profile.difficulty === "relaxed";
  return rows.map((row) => {
    const tag = choice.tags[row.piece.id] ?? "gentle";
    const sold = sells(row.hearts, tag);
    const cameBack = !sold && relaxed;
    return {
      pieceId: row.piece.id,
      tag,
      hearts: row.hearts,
      price: sold ? tagPrice(row.fair, tag) : cameBack ? tagPrice(row.fair, "gentle") : 0,
      sold: sold || cameBack,
      cameBack,
    };
  });
}

function shelfSales(state: GameState, choice: PopupChoice): ShelfSale[] {
  const overall = launchResult(state)?.overall ?? 0;
  const pieces = marketPieces(state);
  const selling = shelfSells(state);
  return choice.shelf.flatMap((id) => {
    const piece = pieces.find((entry) => entry.id === id);
    if (piece === undefined) return [];
    return [{ pieceId: id, coins: selling ? salePrice(piece, overall) : 0, sold: selling }];
  });
}

export function openPopup(state: GameState, choice: PopupChoice): GameState {
  const collection = popupCollection(state);
  const result = launchResult(state);
  const launch = state.launch;
  if (collection === null || result === null || launch === null || !canOpenPopup(state, choice).ok)
    return state;
  const spent = spendHours(state, POPUP_HOURS);
  if (spent === null) return state;
  const rows = popupBoard(state, choice.plinth);
  const entries = entriesFor(state, rows, choice);
  const shelf = shelfSales(state, choice);
  const soldPieces = rows.filter(
    (row) => entries.find((entry) => entry.pieceId === row.piece.id)?.sold === true,
  );
  const lineTotal = entries.reduce((sum, entry) => sum + entry.price, 0);
  const total = lineTotal + shelf.reduce((sum, sale) => sum + sale.coins, 0);
  const lines = saleTraitLines(
    state.profile.trait,
    total,
    [...new Set(soldPieces.flatMap((row) => row.piece.colours))],
    [...new Set(soldPieces.flatMap((row) => row.piece.tags))],
    state.trends.current,
  );
  const coins = total + lines.reduce((sum, line) => sum + line.amount, 0);
  const tallies: HeartTally[] = entries.map((entry) => ({
    pieceId: entry.pieceId,
    hearts: entry.hearts,
    need: priceTagById(entry.cameBack ? "gentle" : entry.tag).hearts,
    sold: entry.sold,
  }));
  const count = copyRequestCount(tallies);
  const lovedId = mostLoved(tallies);
  const loved = rows.find((row) => row.piece.id === lovedId);
  const theme = launchThemeById(result.themeId);
  const [pendingCopies, rng] =
    count > 0 && loved !== undefined
      ? copyRequestsFor(loved.piece, count, theme.tags[0], loved.fair, spent.rng)
      : [[], spent.rng];
  const unsold = rows.filter((row) => !soldPieces.includes(row));
  const filled = unsold.reduce((fill, row) => addToDrawer(fill, row.piece), {
    drawer: collection.drawer,
    sold: [] as readonly string[],
    coins: 0,
  });
  const shelfSold = new Set(shelf.filter((sale) => sale.sold).map((sale) => sale.pieceId));
  const buzz = soldPieces.length + shelfSold.size;
  const withShelf = withoutDrawerPieces(
    { ...spent, rng, collection: { ...collection, drawer: filled.drawer, pieces: [] } },
    shelfSold,
  );
  const popped: GameState = {
    ...withShelf,
    stallBox: withShelf.stallBox.filter((piece) => !shelfSold.has(piece.id)),
    launch: {
      ...launch,
      pendingCopies,
      popup: {
        day: state.calendar.day,
        seasonNumber: collection.seasonNumber,
        plinth: choice.plinth,
        entries,
        shelf,
        lines,
        coins: coins + filled.coins,
        buzz,
        copyRequests: pendingCopies.length,
      },
    },
  };
  const paid = applyStanding(popped, { coins: coins + filled.coins, reputation: 0, buzz });
  return queueStoryTrigger(paid, "first-popup");
}
