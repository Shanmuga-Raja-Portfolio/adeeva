import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import type { RngState } from "../../../engine/rng";
import { drawDistinct, drawInt } from "../../../engine/rngDraw";
import {
  isCounterDay,
  kindKey,
  orderCardCount,
  type CounterTray,
  type OrderCard,
  type TrayKind,
} from "./counter";
import type { GameState } from "./gameState";

export const MIN_CARD_ITEMS = 2;
export const MAX_CARD_ITEMS = 4;
export const BASE_ITEM_PAY = 3;
export const QUALITY_ITEM_PAY = 3;
export const HOT_TAG_ITEM_BONUS = 1;
export const CHARMER_BOX_BONUS = 1;
export const MIXED_BOX_BONUS = 3;
export const COUNTER_SECONDS = 150;

export function drawCards(
  trays: readonly CounterTray[],
  count: number,
  rng: RngState,
): [OrderCard[], RngState] {
  const pool: TrayKind[] = trays.flatMap((tray) =>
    Array.from({ length: tray.left }, () => ({ productId: tray.productId, colour: tray.colour })),
  );
  const cards: OrderCard[] = [];
  let state = rng;
  for (let index = 0; index < count && pool.length >= MIN_CARD_ITEMS; index += 1) {
    const [size, afterSize] = drawInt(state, MIN_CARD_ITEMS, Math.min(MAX_CARD_ITEMS, pool.length));
    const [items, afterItems] = drawDistinct(afterSize, pool, size);
    state = afterItems;
    cards.push({ items: [...items].sort((a, b) => kindKey(a).localeCompare(kindKey(b))) });
  }
  return [cards, state];
}

export function canOpenCounter(state: GameState): ActionCheck {
  const { counter, calendar } = state;
  if (!isCounterDay(calendar.day)) return actionCheck(["The counter opens on day 7 of each week."]);
  if (counter.session !== null) return actionCheck(["The counter is already open."]);
  if (counter.closedDay === calendar.day) return actionCheck(["The counter is closed until next week."]);
  if (counter.trays.length === 0) return actionCheck(["Bake a counter tray on days 1 to 6 first."]);
  return actionCheck([]);
}

export function openCounter(state: GameState): GameState {
  if (!canOpenCounter(state).ok) return state;
  const [cards, rng] = drawCards(state.counter.trays, orderCardCount(state), state.rng);
  return { ...state, rng, counter: { ...state.counter, session: { cards, sold: [], coins: 0 } } };
}

function countKinds(kinds: readonly TrayKind[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const kind of kinds) counts.set(kindKey(kind), (counts.get(kindKey(kind)) ?? 0) + 1);
  return counts;
}

export function boxAccepts(card: OrderCard, placed: readonly TrayKind[], kind: TrayKind): boolean {
  const wanted = countKinds(card.items).get(kindKey(kind)) ?? 0;
  const already = countKinds(placed).get(kindKey(kind)) ?? 0;
  return already < wanted && placed.length < card.items.length;
}

export function boxPay(state: GameState, trays: readonly CounterTray[]): number {
  const hot = trays.some((tray) => tray.tags.some((tag) => state.trends.current.includes(tag)));
  const items = trays.reduce(
    (sum, tray) =>
      sum +
      BASE_ITEM_PAY +
      Math.round((QUALITY_ITEM_PAY * tray.quality) / 100) +
      (hot ? HOT_TAG_ITEM_BONUS : 0),
    0,
  );
  const extraKinds = new Set(trays.map(kindKey)).size - 1;
  const mixed = MIXED_BOX_BONUS * Math.max(0, extraKinds);
  return items + mixed + (state.profile.trait === "charmer" ? CHARMER_BOX_BONUS : 0);
}

function boxTrays(state: GameState, trayIds: readonly string[]): CounterTray[] | null {
  const trays = trayIds.map((id) => state.counter.trays.find((tray) => tray.id === id));
  if (trays.some((tray) => tray === undefined)) return null;
  const found = trays.filter((tray): tray is CounterTray => tray !== undefined);
  const used = new Map<string, number>();
  for (const tray of found) used.set(tray.id, (used.get(tray.id) ?? 0) + 1);
  return found.every((tray) => (used.get(tray.id) ?? 0) <= tray.left) ? found : null;
}

export function canSellBox(state: GameState, cardIndex: number, trayIds: readonly string[]): ActionCheck {
  const session = state.counter.session;
  if (session === null) return actionCheck(["Open the counter first."]);
  const card = session.cards[cardIndex];
  if (card === undefined) return actionCheck(["That order card is not on the counter."]);
  if (session.sold.includes(cardIndex)) return actionCheck(["That box is already sold."]);
  const trays = boxTrays(state, trayIds);
  if (trays === null) return actionCheck(["Those treats are not on the counter any more."]);
  const wanted = countKinds(card.items);
  const given = countKinds(trays);
  const same =
    trays.length === card.items.length &&
    [...wanted.entries()].every(([key, count]) => given.get(key) === count);
  return actionCheck(same ? [] : ["That box needs something else."]);
}

export function sellBox(state: GameState, cardIndex: number, trayIds: readonly string[]): GameState {
  const session = state.counter.session;
  if (session === null || !canSellBox(state, cardIndex, trayIds).ok) return state;
  const trays = boxTrays(state, trayIds) ?? [];
  const pay = boxPay(state, trays);
  const counts = new Map<string, number>();
  for (const id of trayIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  return {
    ...state,
    coins: state.coins + pay,
    counter: {
      ...state.counter,
      trays: state.counter.trays.map((tray) => ({ ...tray, left: tray.left - (counts.get(tray.id) ?? 0) })),
      session: { ...session, sold: [...session.sold, cardIndex], coins: session.coins + pay },
    },
  };
}

export function closeCounter(state: GameState): GameState {
  const session = state.counter.session;
  if (session === null) return state;
  const shared = state.counter.trays.reduce((sum, tray) => sum + tray.left, 0);
  return {
    ...state,
    counter: {
      ...state.counter,
      trays: [],
      session: null,
      closedDay: state.calendar.day,
      lastSummary: { day: state.calendar.day, coins: session.coins, boxes: session.sold.length, shared },
    },
  };
}
