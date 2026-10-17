import { memberOf, requireById } from "../../../engine/catalog";
import type { DifficultyDef, DifficultyId } from "../../../engine/difficulty";
import { CAREERS, type CareerDef, type CareerId } from "../content/career";
import { CLIENTS, type ClientDef, type PersonDef } from "../content/client";
import { DECOR, DECOR_IDS, type DecorDef, type DecorId } from "../content/decor";
import { DIFFICULTIES } from "../content/difficulty";
import { EXTRA_IDS, EXTRAS, type ExtraDef, type ExtraId } from "../content/extra";
import { FINISH_IDS, FINISHES, type FinishDef, type FinishId } from "../content/finish";
import { AWARDS, type AwardDef, type AwardId } from "../content/launchAward";
import { LAUNCH_SPOTS, type LaunchSpotDef } from "../content/launchSpot";
import { LAUNCH_THEMES, type LaunchThemeDef, type LaunchThemeId } from "../content/launchTheme";
import { LANTERN_COLOURS, type LanternColourDef, type LanternColourId } from "../content/lanternColour";
import { LINE_NAMES, type LineNameDef, type LineNameId } from "../content/lineName";
import { LOFT_SEASONS, type LoftSeasonDef } from "../content/loftSeason";
import { BACKDROPS, type BackdropDef, type BackdropId } from "../content/lookbookBackdrop";
import { PROPS, type PropDef, type PropId } from "../content/lookbookProp";
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
import { POPUP_VISITORS } from "../content/popupVisitor";
import { PRICE_TAGS, type PriceTagDef, type PriceTagId } from "../content/priceTag";
import { STOCK_SIZE_IDS, STOCK_SIZES, type StockSizeDef, type StockSizeId } from "../content/stockSize";
import { STONE_IDS, STONES, type StoneDef, type StoneId } from "../content/stone";
import { STONE_TINT_DEFS, type StoneTint, type StoneTintDef } from "../content/stoneTint";
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

export function orderClientById(id: string): ClientDef | undefined {
  return CLIENTS.find((client) => client.id === id);
}

export function clientById(id: string): PersonDef | undefined {
  return orderClientById(id) ?? POPUP_VISITORS.find((visitor) => visitor.id === id);
}

export function careerById(id: CareerId): CareerDef {
  return requireById(CAREERS, id, "career");
}

export function launchThemeById(id: LaunchThemeId): LaunchThemeDef {
  return requireById(LAUNCH_THEMES, id, "launch theme");
}

export function lanternById(id: LanternColourId): LanternColourDef {
  return requireById(LANTERN_COLOURS, id, "lantern colour");
}

export function backdropById(id: BackdropId): BackdropDef {
  return requireById(BACKDROPS, id, "backdrop");
}

export function propById(id: PropId): PropDef {
  return requireById(PROPS, id, "prop");
}

export function priceTagById(id: PriceTagId): PriceTagDef {
  return requireById(PRICE_TAGS, id, "price tag");
}

export function lineNameById(id: LineNameId): LineNameDef {
  return requireById(LINE_NAMES, id, "line name");
}

export function awardById(id: AwardId): AwardDef {
  return requireById(AWARDS, id, "award");
}

export function tintById(id: StoneTint): StoneTintDef {
  return requireById(STONE_TINT_DEFS, id, "tint");
}

export function spotByNumber(spot: number): LaunchSpotDef {
  const found = LAUNCH_SPOTS.find((entry) => entry.spot === spot);
  if (found === undefined) throw new Error(`Missing spot in catalog: ${spot}`);
  return found;
}

export function seasonByNumber(seasonNumber: number): LoftSeasonDef {
  const season =
    LOFT_SEASONS[(((seasonNumber - 1) % LOFT_SEASONS.length) + LOFT_SEASONS.length) % LOFT_SEASONS.length];
  if (season === undefined) throw new Error(`Missing season ${seasonNumber}`);
  return season;
}

export function storyBeatById(id: string): StoryBeatDef | undefined {
  return STORY_BEATS.find((beat) => beat.id === id);
}

export function knownUpgrade(id: string): UpgradeDef | undefined {
  return isUpgradeId(id) ? upgradeById(id) : undefined;
}
