import type { ColourId } from "../../../engine/palette";
import { MENU_ITEM_NAMES, type MenuTierId } from "../content/menuTier";
import { colourById } from "../../../engine/palette";
import { isMenuTierId, menuTierById, seasonByNumber } from "./catalog";
import type { GameState } from "./gameState";
import type { SalonState, SalonTray, TableState } from "./salonState";
import { updateTable } from "./tableSession";

function trayFor(salon: SalonState, tier: MenuTierId): SalonTray | undefined {
  return salon.shelf.find((tray) => tray.tier === tier);
}

function colourIndex(salon: SalonState, tier: MenuTierId, colour: ColourId): number {
  return salon.menu === null ? -1 : salon.menu[tier].colours.indexOf(colour);
}

export function itemName(salon: SalonState, tier: MenuTierId): string {
  const productId = salon.menu?.[tier].productId;
  return (productId === undefined ? undefined : MENU_ITEM_NAMES[productId]) ?? "Treats";
}

export function platingRefusal(
  state: GameState,
  tableIndex: number,
  slotTier: MenuTierId,
  itemTier: MenuTierId,
  colour: ColourId,
): string | null {
  const salon = state.salon;
  const table = salon?.session?.tables[tableIndex];
  const booking = salon?.bookings[tableIndex];
  if (salon === null || table === undefined || booking === undefined) return "That table is not set.";
  if (table.served) return "That table has already been served.";
  if (slotTier !== itemTier)
    return `${itemName(salon, itemTier)} sit on the ${menuTierById(itemTier).name.toLowerCase()}.`;
  if (table.plated[slotTier] !== undefined) return "That tier already has a treat.";
  const tray = trayFor(salon, itemTier);
  const index = colourIndex(salon, itemTier, colour);
  if (tray === undefined || index < 0 || (tray.left[index] ?? 0) === 0)
    return `No ${colourById(colour).name.toLowerCase()} ${itemName(salon, itemTier).toLowerCase()} are left on the shelf.`;
  const booked = booking.colours[slotTier];
  const bookedIndex = colourIndex(salon, slotTier, booked);
  if (colour !== booked && (tray.left[bookedIndex] ?? 0) > 0)
    return `Table ${tableIndex + 1} booked ${colourById(booked).name.toLowerCase()} for the ${menuTierById(slotTier).name.toLowerCase()}.`;
  return null;
}

function seasonTagged(state: GameState, tray: SalonTray): boolean {
  const fair = state.fair;
  if (fair === null) return false;
  const tags = seasonByNumber(fair.seasonNumber).menuTags;
  return tray.tags.some((tag) => tags.includes(tag));
}

export function plateItem(
  state: GameState,
  tableIndex: number,
  tier: MenuTierId,
  colour: ColourId,
): GameState {
  if (!isMenuTierId(tier) || platingRefusal(state, tableIndex, tier, tier, colour) !== null) return state;
  const salon = state.salon;
  const tray = salon === null ? undefined : trayFor(salon, tier);
  const booking = salon?.bookings[tableIndex];
  if (salon === null || tray === undefined || booking === undefined) return state;
  const index = colourIndex(salon, tier, colour);
  const plated = updateTable(state, tableIndex, (table): TableState => ({
    ...table,
    plated: {
      ...table.plated,
      [tier]: {
        colour,
        quality: tray.quality,
        seasonTag: seasonTagged(state, tray),
        swapped: colour !== booking.colours[tier],
      },
    },
  }));
  if (plated === state || plated.salon === null) return state;
  const shelf = plated.salon.shelf.map((entry) =>
    entry.id === tray.id
      ? {
          ...entry,
          left: entry.left.map((count, at) => (at === index ? count - 1 : count)) as [number, number],
        }
      : entry,
  );
  return { ...plated, salon: { ...plated.salon, shelf } };
}

export function unplateItem(state: GameState, tableIndex: number, tier: MenuTierId): GameState {
  if (!isMenuTierId(tier)) return state;
  const salon = state.salon;
  const item = salon?.session?.tables[tableIndex]?.plated[tier];
  const tray = salon === null ? undefined : trayFor(salon, tier);
  if (salon === null || item === undefined || tray === undefined) return state;
  const index = colourIndex(salon, tier, item.colour);
  const cleared = updateTable(state, tableIndex, (table): TableState => {
    const rest = Object.fromEntries(Object.entries(table.plated).filter(([key]) => key !== tier));
    return { ...table, plated: rest };
  });
  if (cleared === state || cleared.salon === null) return state;
  const shelf = cleared.salon.shelf.map((entry) =>
    entry.id === tray.id
      ? {
          ...entry,
          left: entry.left.map((count, at) => (at === index ? count + 1 : count)) as [number, number],
        }
      : entry,
  );
  return { ...cleared, salon: { ...cleared.salon, shelf } };
}
