import type { ColourId } from "../../../engine/palette";
import type { StyleTag } from "../../../engine/styleTag";
import type { MenuTierId } from "../content/menuTier";
import type { MixId } from "../content/mix";
import type { CounterProductId } from "../content/product";
import type { TeaId } from "../content/tea";

export const PARLOUR_STATES = ["undecided", "open", "resting"] as const;
export type ParlourState = (typeof PARLOUR_STATES)[number];

export interface MenuEntry {
  readonly productId: CounterProductId;
  readonly mixId: MixId;
  readonly colours: readonly [ColourId, ColourId];
}

export type SalonMenu = Readonly<Record<MenuTierId, MenuEntry>>;

export interface Booking {
  readonly guestId: string;
  readonly colours: Readonly<Record<MenuTierId, ColourId>>;
  readonly teas: readonly [TeaId, TeaId];
  readonly occasion: boolean;
}

export interface SalonTray {
  readonly id: string;
  readonly tier: MenuTierId;
  readonly quality: number;
  readonly tags: readonly StyleTag[];
  readonly left: readonly [number, number];
}

export interface PlatedItem {
  readonly colour: ColourId;
  readonly quality: number;
  readonly seasonTag: boolean;
  readonly swapped: boolean;
}

export interface TeaPour {
  readonly ml: number;
  readonly actions: number;
  readonly assisted: boolean;
  readonly band: number;
}

export interface TableState {
  readonly plated: Readonly<Partial<Record<MenuTierId, PlatedItem>>>;
  readonly pour: TeaPour | null;
  readonly served: boolean;
  readonly pay: number;
}

export interface TableSession {
  readonly tables: readonly TableState[];
  readonly coins: number;
}

export interface SalonSummary {
  readonly day: number;
  readonly coins: number;
  readonly served: number;
  readonly tables: number;
  readonly toCounter: number;
  readonly shared: number;
}

export interface SalonState {
  readonly parlour: ParlourState;
  readonly menu: SalonMenu | null;
  readonly bookings: readonly Booking[];
  readonly shelf: readonly SalonTray[];
  readonly session: TableSession | null;
  readonly doneDay: number;
  readonly lastSummary: SalonSummary | null;
  readonly graceSeason: number;
  readonly nextTrayNumber: number;
}

export const EMPTY_SALON: SalonState = {
  parlour: "undecided",
  menu: null,
  bookings: [],
  shelf: [],
  session: null,
  doneDay: 0,
  lastSummary: null,
  graceSeason: 0,
  nextTrayNumber: 1,
};

export const EMPTY_TABLE: TableState = { plated: {}, pour: null, served: false, pay: 0 };
