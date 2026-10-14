import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { MENU_TIERS } from "../content/menuTier";
import { counterCapacity, type CounterTray } from "./counter";
import type { GameState } from "./gameState";
import { EMPTY_TABLE, type SalonState, type SalonTray, type TableState } from "./salonState";
import { isSalonDay } from "./seasonCalendar";

export const SALON_SECONDS = 180;
export const QUIET_PARLOUR = "A quiet day in the parlour.";

export function shelfItemCount(salon: SalonState): number {
  return salon.shelf.reduce((sum, tray) => sum + tray.left[0] + tray.left[1], 0);
}

export function canOpenTables(state: GameState): ActionCheck {
  const salon = state.salon;
  if (salon === null || !isSalonDay(state)) return actionCheck(["The Comet Room opens on Salon Day."]);
  if (salon.session !== null) return actionCheck(["The Comet Room is already open."]);
  if (salon.doneDay === state.calendar.day) return actionCheck(["The tables are cleared for today."]);
  if (salon.menu === null || salon.bookings.length === 0)
    return actionCheck(["Set the season's menu first. " + QUIET_PARLOUR]);
  if (shelfItemCount(salon) === 0)
    return actionCheck([`${QUIET_PARLOUR} Bake salon trays before Salon Day.`]);
  return actionCheck([]);
}

export function openTables(state: GameState): GameState {
  const salon = state.salon;
  if (salon === null || !canOpenTables(state).ok) return state;
  const tables = salon.bookings.map(() => EMPTY_TABLE);
  return { ...state, salon: { ...salon, session: { tables, coins: 0 } } };
}

export function updateTable(
  state: GameState,
  tableIndex: number,
  update: (table: TableState, salon: SalonState) => TableState | null,
): GameState {
  const salon = state.salon;
  const session = salon?.session ?? null;
  if (salon === null || session === null || !Number.isInteger(tableIndex)) return state;
  const table = session.tables[tableIndex];
  if (table === undefined || table.served) return state;
  const next = update(table, salon);
  if (next === null || next === table) return state;
  const tables = session.tables.map((entry, index) => (index === tableIndex ? next : entry));
  return { ...state, salon: { ...salon, session: { ...session, tables } } };
}

function returnPlated(salon: SalonState, tables: readonly TableState[]): readonly SalonTray[] {
  const menu = salon.menu;
  if (menu === null) return salon.shelf;
  return salon.shelf.map((tray) => {
    const colours = menu[tray.tier].colours;
    const back = tables
      .filter((table) => !table.served)
      .flatMap((table) => {
        const item = table.plated[tray.tier];
        return item === undefined ? [] : [item.colour];
      });
    const first = back.filter((colour) => colour === colours[0]).length;
    return { ...tray, left: [tray.left[0] + first, tray.left[1] + back.length - first] as const };
  });
}

function leftoverTrays(state: GameState, shelf: readonly SalonTray[]): CounterTray[] {
  const menu = state.salon?.menu ?? null;
  if (menu === null) return [];
  return MENU_TIERS.flatMap((tier) => {
    const tray = shelf.find((entry) => entry.tier === tier.id);
    if (tray === undefined) return [];
    const entry = menu[tier.id];
    return entry.colours.flatMap((colour, index) => {
      const left = tray.left[index] ?? 0;
      return left === 0
        ? []
        : [{ id: "", productId: entry.productId, colour, quality: tray.quality, tags: tray.tags, left }];
    });
  });
}

export function finishSalonDay(state: GameState): GameState {
  const salon = state.salon;
  if (salon === null || !isSalonDay(state) || salon.doneDay === state.calendar.day) return state;
  const session = salon.session;
  const shelf = session === null ? salon.shelf : returnPlated(salon, session.tables);
  const leftovers = leftoverTrays(state, shelf);
  const room = Math.max(0, counterCapacity(state) - state.counter.trays.length);
  const moved = leftovers.slice(0, room).map((tray, index) => ({
    ...tray,
    id: `tray-${state.counter.nextTrayNumber + index}`,
  }));
  const toCounter = moved.reduce((sum, tray) => sum + tray.left, 0);
  const all = leftovers.reduce((sum, tray) => sum + tray.left, 0);
  const served = session === null ? 0 : session.tables.filter((table) => table.served).length;
  return {
    ...state,
    counter: {
      ...state.counter,
      trays: [...state.counter.trays, ...moved],
      nextTrayNumber: state.counter.nextTrayNumber + moved.length,
    },
    salon: {
      ...salon,
      shelf: [],
      session: null,
      doneDay: state.calendar.day,
      lastSummary: {
        day: state.calendar.day,
        coins: session?.coins ?? 0,
        served,
        tables: salon.bookings.length,
        toCounter,
        shared: all - toCounter,
      },
    },
  };
}
