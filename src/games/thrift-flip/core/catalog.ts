import { requireById } from "../../../engine/catalog";
import type { DifficultyDef, DifficultyId } from "../../../engine/difficulty";
import { partById as adeevaPartById } from "../../adeeva/core/catalog";
import type { GarmentPartDef } from "../../adeeva/content/garmentPart";
import { MATERIALS, type MaterialDef } from "../../adeeva/content/material";
import type { MaterialId } from "../../../engine/palette";
import { TRIM_IDS, TRIMS, type TrimDef, type TrimId } from "../../adeeva/content/trim";
import { FABRICS, type FabricDef } from "../../adeeva/content/fabric";
import { BOUTIQUE_CLIENTS } from "../content/boutiqueClient";
import { CAREERS, type CareerDef, type CareerId } from "../content/career";
import { CLIENTS, type ClientDef, type ClientPerson } from "../content/client";
import { SEASONS, type SeasonDef, type SeasonId } from "../content/season";
import { SHOP_SIGNS, type ShopSignDef, type ShopSignId } from "../content/shopSign";
import { TICKETS, type TicketDef, type TicketId } from "../content/ticket";
import { TICKET_CLIENTS } from "../content/ticketClient";
import { WINDOW_PROPS, type WindowPropDef, type WindowPropId } from "../content/windowProp";
import { CONDITIONS, type ConditionDef, type ConditionGrade } from "../content/condition";
import { DIFFICULTIES } from "../content/difficulty";
import { FINDS, type FindDef, type FindId } from "../content/find";
import { MARKS, PATCHES, type MarkDef, type MarkId, type PatchDef, type PatchId } from "../content/finish";
import { RECIPE_IDS, RECIPES, type RecipeDef, type RecipeId } from "../content/recipe";
import { STORY_BEATS, type StoryBeatDef } from "../content/storyBeat";
import { UPGRADE_IDS, UPGRADES, type UpgradeDef, type UpgradeId } from "../content/upgrade";

export function isRecipeId(value: string): value is RecipeId {
  return RECIPE_IDS.some((id) => id === value);
}

export function isTrimId(value: string): value is TrimId {
  return TRIM_IDS.some((id) => id === value);
}

export function isUpgradeId(value: string): value is UpgradeId {
  return UPGRADE_IDS.some((id) => id === value);
}

export function findById(id: FindId): FindDef {
  return requireById(FINDS, id, "find");
}

export function recipeById(id: RecipeId): RecipeDef {
  return requireById(RECIPES, id, "recipe");
}

export function conditionById(id: ConditionGrade): ConditionDef {
  return requireById(CONDITIONS, id, "condition");
}

export const COMMISSION_CLIENTS: readonly ClientDef[] = [...CLIENTS, ...BOUTIQUE_CLIENTS];
const PEOPLE: readonly ClientPerson[] = [...COMMISSION_CLIENTS, ...TICKET_CLIENTS];

export function clientById(id: string): ClientDef | undefined {
  return COMMISSION_CLIENTS.find((client) => client.id === id);
}

export function personById(id: string): ClientPerson | undefined {
  return PEOPLE.find((person) => person.id === id);
}

export function careerById(id: CareerId): CareerDef {
  return requireById(CAREERS, id, "career");
}

export function ticketById(id: TicketId): TicketDef {
  return requireById(TICKETS, id, "ticket");
}

export function seasonById(id: SeasonId): SeasonDef {
  return requireById(SEASONS, id, "season");
}

export function signById(id: ShopSignId): ShopSignDef {
  return requireById(SHOP_SIGNS, id, "shop sign");
}

export function propById(id: WindowPropId): WindowPropDef {
  return requireById(WINDOW_PROPS, id, "window prop");
}

export function partById(id: string): GarmentPartDef | undefined {
  return adeevaPartById(id);
}

export function materialById(id: MaterialId): MaterialDef {
  return requireById(MATERIALS, id, "material");
}

export function trimById(id: TrimId): TrimDef {
  return requireById(TRIMS, id, "trim");
}

export function patchById(id: PatchId): PatchDef {
  return requireById(PATCHES, id, "patch");
}

export function markById(id: MarkId): MarkDef {
  return requireById(MARKS, id, "finish");
}

export function fabricById(id: string): FabricDef | undefined {
  return FABRICS.find((fabric) => fabric.id === id);
}

export function difficultyById(id: DifficultyId): DifficultyDef {
  return requireById(DIFFICULTIES, id, "difficulty");
}

export function upgradeById(id: UpgradeId): UpgradeDef {
  return requireById(UPGRADES, id, "upgrade");
}

export function storyBeatById(id: string): StoryBeatDef | undefined {
  return STORY_BEATS.find((beat) => beat.id === id);
}

export function knownUpgrade(id: string): UpgradeDef | undefined {
  return isUpgradeId(id) ? upgradeById(id) : undefined;
}
