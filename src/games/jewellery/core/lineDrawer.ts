import { productById } from "./catalog";
import type { StallPiece } from "./stallBox";

export const DRAWER_SIZE = 8;
const GENTLE_FACTOR = 0.8;

export interface DrawerFill {
  readonly drawer: readonly StallPiece[];
  readonly sold: readonly string[];
  readonly coins: number;
}

export function asStallPiece(piece: StallPiece): StallPiece {
  return {
    id: piece.id,
    look: piece.look,
    quality: piece.quality,
    tags: piece.tags,
    colours: piece.colours,
    madeDay: piece.madeDay,
  };
}

export function drawerGentlePrice(piece: StallPiece): number {
  const base = productById(piece.look.productId).stallBase;
  return Math.round(base * (0.6 + (0.6 * piece.quality) / 100) * GENTLE_FACTOR);
}

export function addToDrawer(fill: DrawerFill, piece: StallPiece): DrawerFill {
  const drawer = [...fill.drawer, asStallPiece(piece)];
  if (drawer.length <= DRAWER_SIZE) return { ...fill, drawer };
  const [oldest, ...rest] = drawer;
  if (oldest === undefined) return { ...fill, drawer };
  return { drawer: rest, sold: [...fill.sold, oldest.id], coins: fill.coins + drawerGentlePrice(oldest) };
}
