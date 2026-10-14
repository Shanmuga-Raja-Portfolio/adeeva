import type { RngState } from "../../../engine/rng";
import { drawDistinct, drawInt, drawItem } from "../../../engine/rngDraw";
import { CLIENTS } from "../content/client";
import { MENU_TIER_IDS, type MenuTierId } from "../content/menuTier";
import { TEA_IDS, type TeaId } from "../content/tea";
import type { ColourId } from "../../../engine/palette";
import type { GameState } from "./gameState";
import type { Booking, SalonMenu } from "./salonState";

export const BASE_TABLES = 4;
export const OCCASION_ODDS = 4;
export const EXTRA_TABLE_TENT = 3;

export function tableCount(state: GameState): number {
  const trolley = state.upgrades.includes("tea-trolley") ? 1 : 0;
  const tent = state.fair !== null && state.fair.tent >= EXTRA_TABLE_TENT ? 1 : 0;
  return BASE_TABLES + trolley + tent;
}

function drawBooking(guestId: string, menu: SalonMenu, rng: RngState): [Booking, RngState] {
  let state = rng;
  const colours: [MenuTierId, ColourId][] = [];
  for (const tier of MENU_TIER_IDS) {
    const [colour, next] = drawItem(state, menu[tier].colours);
    colours.push([tier, colour]);
    state = next;
  }
  const [first, afterFirst] = drawItem<TeaId>(state, TEA_IDS);
  const [second, afterSecond] = drawItem<TeaId>(
    afterFirst,
    TEA_IDS.filter((tea) => tea !== first),
  );
  const [roll, afterRoll] = drawInt(afterSecond, 1, OCCASION_ODDS);
  return [
    {
      guestId,
      colours: Object.fromEntries(colours) as Record<MenuTierId, ColourId>,
      teas: [first, second],
      occasion: roll === 1,
    },
    afterRoll,
  ];
}

export function drawBookings(menu: SalonMenu, count: number, rng: RngState): [Booking[], RngState] {
  const [guests, afterGuests] = drawDistinct(
    rng,
    CLIENTS.map((client) => client.id),
    count,
  );
  let state = afterGuests;
  const bookings: Booking[] = [];
  for (const guestId of guests) {
    const [booking, next] = drawBooking(guestId, menu, state);
    bookings.push(booking);
    state = next;
  }
  return [bookings, state];
}
