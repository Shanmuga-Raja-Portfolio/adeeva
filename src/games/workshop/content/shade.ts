import { COLOURS, type ColourId } from "../../../engine/palette";
import { WOOD_TONES, type WoodToneId } from "./woodTone";

export type ShadeId = ColourId | WoodToneId;

export interface ShadeDef {
  readonly id: ShadeId;
  readonly name: string;
  readonly hex: string;
}

export const SHADES: readonly ShadeDef[] = [...COLOURS, ...WOOD_TONES];

export const SHADE_IDS: readonly ShadeId[] = SHADES.map((shade) => shade.id);
