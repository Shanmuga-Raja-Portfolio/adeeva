import type { ColourId } from "../../../engine/palette";
import type { StyleTag } from "../../../engine/styleTag";
import { isWeekEnd } from "../../../engine/week";
import type { TrayProductId } from "../content/product";
import type { GameState } from "./gameState";

export const TRAY_ITEMS = 6;
export const BASE_COUNTER_TRAYS = 3;
export const DISPLAY_COUNTER_TRAYS = 4;
export const BASE_ORDER_CARDS = 6;
export const DISPLAY_ORDER_CARDS = 8;

export interface TrayKind {
  readonly productId: TrayProductId;
  readonly colour: ColourId;
}

export interface CounterTray extends TrayKind {
  readonly id: string;
  readonly quality: number;
  readonly tags: readonly StyleTag[];
  readonly left: number;
}

export interface OrderCard {
  readonly items: readonly TrayKind[];
}

export interface CounterSession {
  readonly cards: readonly OrderCard[];
  readonly sold: readonly number[];
  readonly coins: number;
}

export interface CounterSummary {
  readonly day: number;
  readonly coins: number;
  readonly boxes: number;
  readonly shared: number;
}

export interface CounterState {
  readonly trays: readonly CounterTray[];
  readonly session: CounterSession | null;
  readonly closedDay: number;
  readonly nextTrayNumber: number;
  readonly lastSummary: CounterSummary | null;
}

export const EMPTY_COUNTER: CounterState = {
  trays: [],
  session: null,
  closedDay: 0,
  nextTrayNumber: 1,
  lastSummary: null,
};

export function isCounterDay(day: number): boolean {
  return isWeekEnd(day);
}

export function counterCapacity(state: GameState): number {
  return state.upgrades.includes("display-counter") ? DISPLAY_COUNTER_TRAYS : BASE_COUNTER_TRAYS;
}

export function orderCardCount(state: GameState): number {
  return state.upgrades.includes("display-counter") ? DISPLAY_ORDER_CARDS : BASE_ORDER_CARDS;
}

export function kindKey(kind: TrayKind): string {
  return `${kind.productId}:${kind.colour}`;
}
