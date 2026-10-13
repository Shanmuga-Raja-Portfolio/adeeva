import { CAREERS, type CareerDef, type CareerId } from "../content/career";
import { CLIENTS, type ClientDef } from "../content/client";
import { COLOURS, type ColourId } from "../content/colour";
import { DIFFICULTIES, type DifficultyDef, type DifficultyId } from "../content/difficulty";
import { FABRICS, type FabricDef } from "../content/fabric";
import {
  GARMENT_PARTS,
  PART_CATEGORIES,
  type GarmentPartDef,
  type PartCategory,
} from "../content/garmentPart";
import { GARMENT_SLOTS, type GarmentSlot } from "../content/garmentSlot";
import { MATERIALS, type MaterialDef, type MaterialId } from "../content/material";
import { SHOW_THEMES, type ShowThemeDef } from "../content/showTheme";
import { STORY_BEATS, type StoryBeatDef } from "../content/storyBeat";
import { TRIM_IDS, TRIMS, type TrimDef, type TrimId } from "../content/trim";
import { UPGRADE_IDS, UPGRADES, type UpgradeDef, type UpgradeId } from "../content/upgrade";

type ColourDef = (typeof COLOURS)[number];

function requireEntry<T extends { readonly id: string }>(items: readonly T[], id: string, kind: string): T {
  const found = items.find((item) => item.id === id);
  if (found === undefined) throw new Error(`Missing ${kind} in catalog: ${id}`);
  return found;
}

export function isTrimId(value: string): value is TrimId {
  return TRIM_IDS.some((id) => id === value);
}

export function isUpgradeId(value: string): value is UpgradeId {
  return UPGRADE_IDS.some((id) => id === value);
}

export function isPartCategory(value: string): value is PartCategory {
  return PART_CATEGORIES.some((category) => category === value);
}

export function isGarmentSlot(value: string): value is GarmentSlot {
  return GARMENT_SLOTS.some((slot) => slot === value);
}

export function fabricById(id: string): FabricDef | undefined {
  return FABRICS.find((fabric) => fabric.id === id);
}

export function partById(id: string): GarmentPartDef | undefined {
  return GARMENT_PARTS.find((part) => part.id === id);
}

export function clientById(id: string): ClientDef | undefined {
  return CLIENTS.find((client) => client.id === id);
}

export function themeById(id: string): ShowThemeDef | undefined {
  return SHOW_THEMES.find((theme) => theme.id === id);
}

export function storyBeatById(id: string): StoryBeatDef | undefined {
  return STORY_BEATS.find((beat) => beat.id === id);
}

export function materialById(id: MaterialId): MaterialDef {
  return requireEntry(MATERIALS, id, "material");
}

export function trimById(id: TrimId): TrimDef {
  return requireEntry(TRIMS, id, "trim");
}

export function careerById(id: CareerId): CareerDef {
  return requireEntry(CAREERS, id, "career");
}

export function difficultyById(id: DifficultyId): DifficultyDef {
  return requireEntry(DIFFICULTIES, id, "difficulty");
}

export function upgradeById(id: UpgradeId): UpgradeDef {
  return requireEntry(UPGRADES, id, "upgrade");
}

export function colourById(id: ColourId): ColourDef {
  return requireEntry(COLOURS, id, "colour");
}
