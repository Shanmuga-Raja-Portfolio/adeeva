import { memberOf, requireById } from "../../../engine/catalog";
import type { DifficultyDef, DifficultyId } from "../../../engine/difficulty";
import { CLIENTS, type ClientDef } from "../content/client";
import { DIFFICULTIES } from "../content/difficulty";
import { FILLING_IDS, FILLINGS, type FillingDef, type FillingId } from "../content/filling";
import { INGREDIENT_IDS, INGREDIENTS, type IngredientDef, type IngredientId } from "../content/ingredient";
import { MIX_IDS, MIXES, type MixDef, type MixId } from "../content/mix";
import { PRODUCT_IDS, PRODUCTS, type ProductDef, type ProductId } from "../content/product";
import { STORY_BEATS, type StoryBeatDef } from "../content/storyBeat";
import { TOPPING_IDS, TOPPINGS, type ToppingDef, type ToppingId } from "../content/topping";
import { UPGRADE_IDS, UPGRADES, type UpgradeDef, type UpgradeId } from "../content/upgrade";

export const isIngredientId = memberOf(INGREDIENT_IDS);
export const isMixId = memberOf(MIX_IDS);
export const isFillingId = memberOf(FILLING_IDS);
export const isProductId = memberOf(PRODUCT_IDS);
export const isToppingId = memberOf(TOPPING_IDS);
export const isUpgradeId = memberOf(UPGRADE_IDS);

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

export function clientById(id: string): ClientDef | undefined {
  return CLIENTS.find((client) => client.id === id);
}

export function storyBeatById(id: string): StoryBeatDef | undefined {
  return STORY_BEATS.find((beat) => beat.id === id);
}

export function knownUpgrade(id: string): UpgradeDef | undefined {
  return isUpgradeId(id) ? upgradeById(id) : undefined;
}
