import type { PriceTagId } from "../content/priceTag";
import { priceTagById, productById } from "./catalog";
import type { CollectionPiece } from "./collectionState";

const HARMONY_MARK = 80;
const HARMONY_BOOST = 1.1;
const AWARD_BOOST = 1.1;

export interface PriceTerms {
  readonly harmony: number;
  readonly silverOrBetter: boolean;
}

export function fairPrice(
  piece: Pick<CollectionPiece, "look" | "quality" | "sparkle">,
  terms: PriceTerms,
): number {
  const base = productById(piece.look.productId).lineBase;
  const harmony = terms.harmony >= HARMONY_MARK ? HARMONY_BOOST : 1;
  const award = terms.silverOrBetter ? AWARD_BOOST : 1;
  return Math.round(
    base * (0.6 + (0.6 * piece.quality) / 100) * (1 + 0.15 * (piece.sparkle - 1)) * harmony * award,
  );
}

export function tagPrice(fair: number, tag: PriceTagId): number {
  return Math.round(fair * priceTagById(tag).factor);
}

export function sparkleBonus(piece: Pick<CollectionPiece, "look" | "quality" | "sparkle">): number {
  const base = productById(piece.look.productId).lineBase;
  return Math.round(base * (0.6 + (0.6 * piece.quality) / 100) * 0.15 * (piece.sparkle - 1));
}

export function sells(hearts: number, tag: PriceTagId): boolean {
  return hearts >= priceTagById(tag).hearts;
}

export function dearestTag(hearts: number): PriceTagId {
  if (sells(hearts, "special")) return "special";
  return sells(hearts, "fair") ? "fair" : "gentle";
}
