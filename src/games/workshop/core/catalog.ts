import { memberOf, requireById } from "../../../engine/catalog";
import type { DifficultyDef, DifficultyId } from "../../../engine/difficulty";
import { BOARD_SIZES, type BoardSizeDef, type BoardSizeId } from "../content/boardSize";
import {
  BOOTH_BACKDROP_IDS,
  BOOTH_BACKDROPS,
  type BoothBackdropDef,
  type BoothBackdropId,
} from "../content/boothBackdrop";
import { CAREER_IDS, CAREERS, type CareerDef, type CareerId } from "../content/career";
import { CLIENTS, type ClientDef } from "../content/client";
import { CUSHION_FABRICS, type CushionFabricDef, type CushionFabricId } from "../content/cushionFabric";
import { DECOR_IDS, DECORS, type DecorDef, type DecorId } from "../content/decor";
import { DIFFICULTIES } from "../content/difficulty";
import { EXTRAS, type ExtraDef, type ExtraId } from "../content/extra";
import { FAIR_BOOTHS, type FairBoothDef, type FairBoothNumber } from "../content/fairBooth";
import { FAIR_MUSIC, FAIR_MUSIC_IDS, type FairMusicDef, type FairMusicId } from "../content/fairMusic";
import { FAIR_THEME_IDS, FAIR_THEMES, type FairThemeDef, type FairThemeId } from "../content/fairTheme";
import { FINISHES, type FinishDef, type FinishId } from "../content/finish";
import { JOINT_KIND_DEFS, JOINT_KINDS, type JointKindDef, type JointKindId } from "../content/jointKind";
import { MAKERS_NOTE_IDS, MAKERS_NOTES, type MakersNoteDef, type MakersNoteId } from "../content/makersNote";
import { PART_OPTIONS, type PartOptionDef, type PartOptionId } from "../content/partOption";
import { PRODUCTS, type ProductDef, type ProductId } from "../content/product";
import { ROSETTES, type RosetteDef, type RosetteId } from "../content/rosette";
import { SEASONS, type SeasonDef } from "../content/season";
import {
  SET_TEMPLATE_IDS,
  SET_TEMPLATES,
  type SetTemplateDef,
  type SetTemplateId,
} from "../content/setTemplate";
import { SHADES, type ShadeDef, type ShadeId } from "../content/shade";
import { STORY_BEATS, type StoryBeatDef } from "../content/storyBeat";
import { UPGRADE_IDS, UPGRADES, type UpgradeDef, type UpgradeId } from "../content/upgrade";
import { WOODS, type WoodDef, type WoodId } from "../content/wood";

export const isUpgradeId = memberOf(UPGRADE_IDS);
export const isDecorId = memberOf(DECOR_IDS);
export const isCareerId = memberOf(CAREER_IDS);
export const isSetTemplateId = memberOf(SET_TEMPLATE_IDS);
export const isJointKindId = memberOf(JOINT_KINDS);
export const isFairThemeId = memberOf(FAIR_THEME_IDS);
export const isBoothBackdropId = memberOf(BOOTH_BACKDROP_IDS);
export const isFairMusicId = memberOf(FAIR_MUSIC_IDS);
export const isMakersNoteId = memberOf(MAKERS_NOTE_IDS);

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

export function careerById(id: CareerId): CareerDef {
  return requireById(CAREERS, id, "career");
}

export function setTemplateById(id: SetTemplateId): SetTemplateDef {
  return requireById(SET_TEMPLATES, id, "set template");
}

export function fairThemeById(id: FairThemeId): FairThemeDef {
  return requireById(FAIR_THEMES, id, "fair theme");
}

export function fairBoothByNumber(number: FairBoothNumber): FairBoothDef {
  const found = FAIR_BOOTHS.find((booth) => booth.number === number);
  if (found === undefined) throw new Error(`Missing fair booth in catalog: ${number}`);
  return found;
}

export function boothBackdropById(id: BoothBackdropId): BoothBackdropDef {
  return requireById(BOOTH_BACKDROPS, id, "booth backdrop");
}

export function fairMusicById(id: FairMusicId): FairMusicDef {
  return requireById(FAIR_MUSIC, id, "fair music");
}

export function makersNoteById(id: MakersNoteId): MakersNoteDef {
  return requireById(MAKERS_NOTES, id, "maker's note");
}

export function rosetteById(id: RosetteId): RosetteDef {
  return requireById(ROSETTES, id, "rosette");
}

export function seasonByNumber(seasonNumber: number): SeasonDef {
  const index = (((seasonNumber - 1) % SEASONS.length) + SEASONS.length) % SEASONS.length;
  const season = SEASONS[index];
  if (season === undefined) throw new Error(`Missing season ${seasonNumber}`);
  return season;
}
