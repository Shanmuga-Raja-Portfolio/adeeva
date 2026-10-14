import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { average } from "../../../engine/average";
import { applyStanding } from "../../../engine/standing";
import { MENU_TIER_IDS } from "../content/menuTier";
import type { TeaId } from "../content/tea";
import { teaById } from "./catalog";
import type { GameState } from "./gameState";
import type { PlatedItem, TableState } from "./salonState";
import { pourAccuracy } from "./teaPour";

export const TABLE_BASE_PAY = 29;
export const STAND_QUALITY_PAY = 12;
export const POUR_PAY = 6;
export const BOOKING_MATCH_PAY = 4;
export const SWAP_COLOUR_COST = 4;
export const MENU_BONUS_PAY = 3;
export const SILVER_STANDS_MULTIPLIER = 1.1;
export const CHARMER_TABLE_BONUS = 1;
export const TABLE_BUZZ = 2;

export interface TablePayLine {
  readonly label: string;
  readonly amount: number;
}

function platedItems(table: TableState): PlatedItem[] {
  return MENU_TIER_IDS.flatMap((tier) => {
    const item = table.plated[tier];
    return item === undefined ? [] : [item];
  });
}

export function standComplete(table: TableState): boolean {
  return platedItems(table).length === MENU_TIER_IDS.length;
}

export function tablePayLines(state: GameState, table: TableState): TablePayLine[] {
  const items = platedItems(table);
  const quality = average(items.map((item) => item.quality));
  const swapped = items.some((item) => item.swapped);
  const lines: TablePayLine[] = [
    { label: "Table booking", amount: TABLE_BASE_PAY },
    { label: "Stand quality", amount: Math.round((STAND_QUALITY_PAY * quality) / 100) },
    {
      label: "Tea poured",
      amount: table.pour === null ? 0 : Math.round(POUR_PAY * pourAccuracy(table.pour)),
    },
  ];
  if (swapped) lines.push({ label: "Surprise colour", amount: -SWAP_COLOUR_COST });
  else lines.push({ label: "Every tier as booked", amount: BOOKING_MATCH_PAY });
  if (items.some((item) => item.seasonTag)) lines.push({ label: "Season menu", amount: MENU_BONUS_PAY });
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  if (state.upgrades.includes("silver-stands"))
    lines.push({
      label: "Silver Cake Stands",
      amount: Math.round(subtotal * SILVER_STANDS_MULTIPLIER) - subtotal,
    });
  if (state.profile.trait === "charmer") lines.push({ label: "Charmer smile", amount: CHARMER_TABLE_BONUS });
  return lines;
}

export function tablePay(state: GameState, table: TableState): number {
  return Math.max(
    0,
    tablePayLines(state, table).reduce((sum, line) => sum + line.amount, 0),
  );
}

function teasNeeded(teas: readonly TeaId[]): Map<TeaId, number> {
  const needed = new Map<TeaId, number>();
  for (const tea of teas) needed.set(tea, (needed.get(tea) ?? 0) + 1);
  return needed;
}

export function canServeTable(state: GameState, tableIndex: number): ActionCheck {
  const salon = state.salon;
  const table = salon?.session?.tables[tableIndex];
  const booking = salon?.bookings[tableIndex];
  if (salon === null || table === undefined || booking === undefined)
    return actionCheck(["That table is not set."]);
  if (table.served) return actionCheck(["That table has already been served."]);
  const reasons: string[] = [];
  if (!standComplete(table)) reasons.push("Plate a treat on every tier first.");
  if (table.pour === null) reasons.push("Pour the tea first.");
  for (const [tea, cups] of teasNeeded(booking.teas))
    if (state.pantry.teas[tea] < cups) reasons.push(`Buy a tin of ${teaById(tea).name} in the pantry.`);
  return actionCheck(reasons);
}

export function serveTable(state: GameState, tableIndex: number): GameState {
  const salon = state.salon;
  const session = salon?.session ?? null;
  const table = session?.tables[tableIndex];
  const booking = salon?.bookings[tableIndex];
  if (salon === null || session === null || table === undefined || booking === undefined) return state;
  if (!canServeTable(state, tableIndex).ok) return state;
  const pay = tablePay(state, table);
  const teas = { ...state.pantry.teas };
  for (const [tea, cups] of teasNeeded(booking.teas)) teas[tea] -= cups;
  const tables = session.tables.map((entry, index) =>
    index === tableIndex ? { ...entry, served: true, pay } : entry,
  );
  const served: GameState = {
    ...state,
    pantry: { ...state.pantry, teas },
    salon: { ...salon, session: { tables, coins: session.coins + pay } },
  };
  return applyStanding(served, { coins: pay, reputation: 0, buzz: TABLE_BUZZ });
}
