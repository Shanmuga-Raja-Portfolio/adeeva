import { memberOf, requireById } from "../../../engine/catalog";
import type { DifficultyDef, DifficultyId } from "../../../engine/difficulty";
import { CAREER_IDS, CAREERS, type CareerDef, type CareerId } from "../content/career";
import { CLIENTS, type ClientDef } from "../content/client";
import { DIFFICULTIES } from "../content/difficulty";
import { FAIR_MUSIC, FAIR_MUSIC_IDS, type FairMusicDef, type FairMusicId } from "../content/fairMusic";
import { FAIR_TENTS, type FairTentDef, type FairTentNumber } from "../content/fairTent";
import { FAIR_THEME_IDS, FAIR_THEMES, type FairThemeDef, type FairThemeId } from "../content/fairTheme";
import { FILLING_IDS, FILLINGS, type FillingDef, type FillingId } from "../content/filling";
import { FLOURISH_IDS, FLOURISHES, type FlourishDef, type FlourishId } from "../content/flourish";
import { INGREDIENT_IDS, INGREDIENTS, type IngredientDef, type IngredientId } from "../content/ingredient";
import { MENU_TIER_IDS, MENU_TIERS, type MenuTierDef, type MenuTierId } from "../content/menuTier";
import { MIX_IDS, MIXES, type MixDef, type MixId } from "../content/mix";
import { PRODUCT_IDS, PRODUCTS, type ProductDef, type ProductId } from "../content/product";
import { RIBBONS, type RibbonDef, type RibbonId } from "../content/ribbon";
import { SEASONS, type SeasonDef } from "../content/season";
import { STORY_BEATS, type StoryBeatDef } from "../content/storyBeat";
import { TABLE_CLOTH_IDS, TABLE_CLOTHS, type TableClothDef, type TableClothId } from "../content/tableCloth";
import { TEA_IDS, TEAS, type TeaDef, type TeaId } from "../content/tea";
import { TOPPING_IDS, TOPPINGS, type ToppingDef, type ToppingId } from "../content/topping";
import { UPGRADE_IDS, UPGRADES, type UpgradeDef, type UpgradeId } from "../content/upgrade";

export const isIngredientId = memberOf(INGREDIENT_IDS);
export const isMixId = memberOf(MIX_IDS);
export const isFillingId = memberOf(FILLING_IDS);
export const isProductId = memberOf(PRODUCT_IDS);
export const isToppingId = memberOf(TOPPING_IDS);
export const isUpgradeId = memberOf(UPGRADE_IDS);
export const isCareerId = memberOf(CAREER_IDS);
export const isTeaId = memberOf(TEA_IDS);
export const isFairThemeId = memberOf(FAIR_THEME_IDS);
export const isTableClothId = memberOf(TABLE_CLOTH_IDS);
export const isFairMusicId = memberOf(FAIR_MUSIC_IDS);
export const isMenuTierId = memberOf(MENU_TIER_IDS);
export const isFlourishId = memberOf(FLOURISH_IDS);

export function ingredientById(id: IngredientId): IngredientDef {
  return requireById(INGREDIENTS, id, "ingredient");
}

export function mixById(id: MixId): MixDef {
  return requireById(MIXES, id, "mix");
}

export function fillingById(id: FillingId): FillingDef {
  return requireById(FILLINGS, id, "filling");
}

export function productById(id: ProductId): ProductDef {
  return requireById(PRODUCTS, id, "product");
}

export function toppingById(id: ToppingId): ToppingDef {
  return requireById(TOPPINGS, id, "topping");
}

export function upgradeById(id: UpgradeId): UpgradeDef {
  return requireById(UPGRADES, id, "upgrade");
}

export function difficultyById(id: DifficultyId): DifficultyDef {
  return requireById(DIFFICULTIES, id, "difficulty");
}

export function careerById(id: CareerId): CareerDef {
  return requireById(CAREERS, id, "career");
}

export function teaById(id: TeaId): TeaDef {
  return requireById(TEAS, id, "tea");
}

export function fairThemeById(id: FairThemeId): FairThemeDef {
  return requireById(FAIR_THEMES, id, "fair theme");
}

export function tableClothById(id: TableClothId): TableClothDef {
  return requireById(TABLE_CLOTHS, id, "table cloth");
}

export function fairMusicById(id: FairMusicId): FairMusicDef {
  return requireById(FAIR_MUSIC, id, "fair music");
}

export function menuTierById(id: MenuTierId): MenuTierDef {
  return requireById(MENU_TIERS, id, "menu tier");
}

export function flourishById(id: FlourishId): FlourishDef {
  return requireById(FLOURISHES, id, "extra touch");
}

export function ribbonById(id: RibbonId): RibbonDef {
  return requireById(RIBBONS, id, "ribbon");
}

export function fairTentByNumber(tent: FairTentNumber): FairTentDef {
  const found = FAIR_TENTS.find((entry) => entry.tent === tent);
  if (found === undefined) throw new Error(`Unknown fair tent ${tent}`);
  return found;
}

export function seasonByNumber(seasonNumber: number): SeasonDef {
  const season = SEASONS[(((seasonNumber - 1) % SEASONS.length) + SEASONS.length) % SEASONS.length];
  if (season === undefined) throw new Error(`No season ${seasonNumber}`);
  return season;
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
