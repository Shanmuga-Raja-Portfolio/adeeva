import type { DifficultyId } from "../../../engine/difficulty";
import type { JewelColour } from "../content/jewelColour";
import type { JewelTag } from "../content/jewelTag";
import type { LaunchThemeDef } from "../content/launchTheme";
import type { ProductDef, ProductId } from "../content/product";
import type { StoneId } from "../content/stone";
import { difficultyById, productById, spotByNumber } from "./catalog";
import type { CollectionBrief } from "./collectionState";

export interface LineGuide {
  readonly requiredTags: readonly JewelTag[];
  readonly favouredColours: readonly JewelColour[];
  readonly minQuality: number;
}

export const CHARM_MOTIF_PRODUCTS: readonly ProductId[] = ["bangle", "hair-slide", "charm-bracelet"];

export function collectionBrief(theme: LaunchThemeDef, spot: number, difficulty: DifficultyId): LineGuide {
  return {
    requiredTags: theme.tags,
    favouredColours: theme.palette,
    minQuality: spotByNumber(spot).readyMark + difficultyById(difficulty).minQualityBonus,
  };
}

export function hasShapeSlot(product: ProductDef): boolean {
  return product.slots.includes("shape");
}

export function canCarryMotif(productId: ProductId): boolean {
  return hasShapeSlot(productById(productId)) || CHARM_MOTIF_PRODUCTS.includes(productId);
}

export function slotStone(brief: CollectionBrief, productId: ProductId): StoneId | null {
  const seats = productById(productId).seats.length;
  if (seats === 0) return null;
  return seats === 1 ? brief.hero : (brief.accent ?? brief.hero);
}
