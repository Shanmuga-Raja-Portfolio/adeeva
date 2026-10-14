import type { MenuTierId } from "../content/menuTier";
import { TRAY_SPLITS } from "./bakeRun";
import type { Booking, SalonMenu } from "./salonState";

export function splitTally(
  bookings: readonly Booking[],
  menu: SalonMenu,
  tier: MenuTierId,
): [number, number] {
  const [first] = menu[tier].colours;
  const wanted = bookings.filter((booking) => booking.colours[tier] === first).length;
  return [wanted, bookings.length - wanted];
}

function shortfall(split: number, wanted: readonly [number, number]): number {
  return Math.max(0, wanted[0] - split) + Math.max(0, wanted[1] - (TRAY_SPLITS[0] - split));
}

export function coveringSplit(wanted: readonly [number, number]): number {
  const total = TRAY_SPLITS[0];
  const share = wanted[0] + wanted[1] === 0 ? 0.5 : wanted[0] / (wanted[0] + wanted[1]);
  const rank = (split: number) => shortfall(split, wanted) * total + Math.abs(split / total - share);
  return TRAY_SPLITS.reduce<number>((best, split) => (rank(split) < rank(best) ? split : best), total);
}

export function splitCovers(split: number, wanted: readonly [number, number]): boolean {
  return shortfall(split, wanted) === 0;
}
