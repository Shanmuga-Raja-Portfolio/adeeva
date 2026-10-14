import { memberOf, requireById } from "../../../engine/catalog";
import type { DifficultyDef, DifficultyId } from "../../../engine/difficulty";
import { BOARD_SIZES, type BoardSizeDef, type BoardSizeId } from "../content/boardSize";
import { CLIENTS, type ClientDef } from "../content/client";
import { CUSHION_FABRICS, type CushionFabricDef, type CushionFabricId } from "../content/cushionFabric";
import { DECOR_IDS, DECORS, type DecorDef, type DecorId } from "../content/decor";
import { DIFFICULTIES } from "../content/difficulty";
import { EXTRAS, type ExtraDef, type ExtraId } from "../content/extra";
import { FINISHES, type FinishDef, type FinishId } from "../content/finish";
import { JOINT_KIND_DEFS, type JointKindDef, type JointKindId } from "../content/jointKind";
import { PART_OPTIONS, type PartOptionDef, type PartOptionId } from "../content/partOption";
import { PRODUCTS, type ProductDef, type ProductId } from "../content/product";
import { SHADES, type ShadeDef, type ShadeId } from "../content/shade";
import { STORY_BEATS, type StoryBeatDef } from "../content/storyBeat";
import { UPGRADE_IDS, UPGRADES, type UpgradeDef, type UpgradeId } from "../content/upgrade";
import { WOODS, type WoodDef, type WoodId } from "../content/wood";

export const isUpgradeId = memberOf(UPGRADE_IDS);
export const isDecorId = memberOf(DECOR_IDS);

export function woodById(id: WoodId): WoodDef {
  return requireById(WOODS, id, "wood");
}

export function boardSizeById(id: BoardSizeId): BoardSizeDef {
  return requireById(BOARD_SIZES, id, "board size");
}

export function productById(id: ProductId): ProductDef {
  return requireById(PRODUCTS, id, "product");
}

export function partOptionById(id: PartOptionId): PartOptionDef {
  return requireById(PART_OPTIONS, id, "part option");
}

export function finishById(id: FinishId): FinishDef {
  return requireById(FINISHES, id, "finish");
}

export function extraById(id: ExtraId): ExtraDef {
  return requireById(EXTRAS, id, "extra");
}

export function jointKindById(id: JointKindId): JointKindDef {
  return requireById(JOINT_KIND_DEFS, id, "joint kind");
}

export function shadeById(id: ShadeId): ShadeDef {
  return requireById(SHADES, id, "shade");
}

export function cushionFabricById(id: CushionFabricId): CushionFabricDef {
  return requireById(CUSHION_FABRICS, id, "cushion fabric");
}

export function upgradeById(id: UpgradeId): UpgradeDef {
  return requireById(UPGRADES, id, "upgrade");
}

export function decorById(id: DecorId): DecorDef {
  return requireById(DECORS, id, "decor");
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
