import { memberOf, requireById } from "../../../engine/catalog";
import type { DifficultyDef, DifficultyId } from "../../../engine/difficulty";
import { CLIENTS, type ClientDef } from "../content/client";
import { DECOR, DECOR_IDS, type DecorDef, type DecorId } from "../content/decor";
import { DIFFICULTIES } from "../content/difficulty";
import { FLOOR_IDS, FLOORS, type FloorDef, type FloorId } from "../content/floor";
import { FURNITURE, FURNITURE_IDS, type FurnitureDef, type FurnitureId } from "../content/furniture";
import { LIGHT_IDS, LIGHTS, type LightDef, type LightId } from "../content/light";
import { LOFT_DECOR, LOFT_DECOR_IDS, type LoftDecorDef, type LoftDecorId } from "../content/loftDecor";
import { PAINT_IDS, PAINTS, type PaintDef, type PaintId } from "../content/paint";
import { ROOMS, type RoomId, type RoomTemplate } from "../content/roomTemplate";
import { STORY_BEATS, type StoryBeatDef } from "../content/storyBeat";
import { UPGRADE_IDS, UPGRADES, type UpgradeDef, type UpgradeId } from "../content/upgrade";

export const isFurnitureId = memberOf(FURNITURE_IDS);
export const isPaintId = memberOf(PAINT_IDS);
export const isFloorId = memberOf(FLOOR_IDS);
export const isLightId = memberOf(LIGHT_IDS);
export const isDecorId = memberOf(DECOR_IDS);
const isUpgradeId = memberOf(UPGRADE_IDS);
export const isLoftDecorId = memberOf(LOFT_DECOR_IDS);

export function furnitureById(id: FurnitureId): FurnitureDef {
  return requireById(FURNITURE, id, "furniture");
}

export function paintById(id: PaintId): PaintDef {
  return requireById(PAINTS, id, "paint");
}

export function floorById(id: FloorId): FloorDef {
  return requireById(FLOORS, id, "floor");
}

export function lightById(id: LightId): LightDef {
  return requireById(LIGHTS, id, "light");
}

export function decorById(id: DecorId): DecorDef {
  return requireById(DECOR, id, "decor");
}

export function roomById(id: RoomId): RoomTemplate {
  return requireById(ROOMS, id, "room");
}

export function upgradeById(id: UpgradeId): UpgradeDef {
  return requireById(UPGRADES, id, "upgrade");
}

export function loftDecorById(id: LoftDecorId): LoftDecorDef {
  return requireById(LOFT_DECOR, id, "loft decor");
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

export function itemName(id: string): string {
  if (isFurnitureId(id)) return furnitureById(id).name;
  if (isDecorId(id)) return decorById(id).name;
  if (isLightId(id)) return lightById(id).name;
  return id;
}
