import { memberOf, requireById } from "../../../engine/catalog";
import type { DifficultyDef, DifficultyId } from "../../../engine/difficulty";
import { CLIENTS, type ClientDef } from "../content/client";
import { DECOR, DECOR_IDS, type DecorDef, type DecorId } from "../content/decor";
import { DIFFICULTIES } from "../content/difficulty";
import { EXTRA_IDS, EXTRAS, type ExtraDef, type ExtraId } from "../content/extra";
import { FINISH_IDS, FINISHES, type FinishDef, type FinishId } from "../content/finish";
import { MARKET_THEMES, type MarketThemeDef, type ThemeId } from "../content/marketTheme";
import { METAL_IDS, METALS, type MetalDef, type MetalId } from "../content/metal";
import { OPTION_IDS, OPTIONS, type OptionDef, type OptionId } from "../content/partOption";
import {
  PRODUCT_IDS,
  PRODUCTS,
  STALL_PRODUCT_IDS,
  type PartDef,
  type ProductDef,
  type ProductId,
} from "../content/product";
import { STOCK_SIZE_IDS, STOCK_SIZES, type StockSizeDef, type StockSizeId } from "../content/stockSize";
import { STONE_IDS, STONES, type StoneDef, type StoneId } from "../content/stone";
import { STORY_BEATS, type StoryBeatDef } from "../content/storyBeat";
import { UPGRADE_IDS, UPGRADES, type UpgradeDef, type UpgradeId } from "../content/upgrade";

export const isMetalId = memberOf(METAL_IDS);
export const isStoneId = memberOf(STONE_IDS);
export const isProductId = memberOf(PRODUCT_IDS);
export const isStallProductId = memberOf(STALL_PRODUCT_IDS);
export const isOptionId = memberOf(OPTION_IDS);
export const isStockSizeId = memberOf(STOCK_SIZE_IDS);
export const isFinishId = memberOf(FINISH_IDS);
export const isExtraId = memberOf(EXTRA_IDS);
export const isUpgradeId = memberOf(UPGRADE_IDS);
export const isDecorId = memberOf(DECOR_IDS);

export function metalById(id: MetalId): MetalDef {
  return requireById(METALS, id, "metal");
}

export function stoneById(id: StoneId): StoneDef {
  return requireById(STONES, id, "stone");
}

export function productById(id: ProductId): ProductDef {
  return requireById(PRODUCTS, id, "product");
}

export function productPart(productId: ProductId, partKey: string): PartDef | undefined {
  return productById(productId).parts.find((part) => part.key === partKey);
}

export function optionById(id: OptionId): OptionDef {
  return requireById(OPTIONS, id, "option");
}

export function stockSizeById(id: StockSizeId): StockSizeDef {
  return requireById(STOCK_SIZES, id, "stock size");
}

export function finishById(id: FinishId): FinishDef {
  return requireById(FINISHES, id, "finish");
}

export function extraById(id: ExtraId): ExtraDef {
  return requireById(EXTRAS, id, "extra");
}

export function upgradeById(id: UpgradeId): UpgradeDef {
  return requireById(UPGRADES, id, "upgrade");
}

export function decorById(id: DecorId): DecorDef {
  return requireById(DECOR, id, "decor");
}

export function themeById(id: ThemeId): MarketThemeDef {
  return requireById(MARKET_THEMES, id, "market theme");
}

export function difficultyById(id: DifficultyId): DifficultyDef {
  return requireById(DIFFICULTIES, id, "difficulty");
}

export function clientById(id: string): ClientDef | undefined {
  return CLIENTS.find((client) => client.id === id);
}

export function storyBeatById(id: string): StoryBeatDef | undefined {
  return STORY_BEATS.find((beat) => beat.id === id);
}

export function knownUpgrade(id: string): UpgradeDef | undefined {
  return isUpgradeId(id) ? upgradeById(id) : undefined;
}
