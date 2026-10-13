import { requireById } from "../../../engine/catalog";
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

function member<T extends string>(ids: readonly T[]): (value: string) => value is T {
  return (value: string): value is T => ids.some((id) => id === value);
}

export const isIngredientId = member(INGREDIENT_IDS);
export const isMixId = member(MIX_IDS);
export const isFillingId = member(FILLING_IDS);
export const isProductId = member(PRODUCT_IDS);
export const isToppingId = member(TOPPING_IDS);
export const isUpgradeId = member(UPGRADE_IDS);

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
