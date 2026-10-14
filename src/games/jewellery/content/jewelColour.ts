import { COLOURS, type ColourId } from "../../../engine/palette";

const METAL_TONES = [
  { id: "silver", name: "Silver", hex: "#c7ccd4" },
  { id: "copper", name: "Copper", hex: "#c47a4a" },
  { id: "bronze", name: "Bronze", hex: "#a0773e" },
  { id: "rose-gold", name: "Rose Gold", hex: "#d9a08b" },
] as const;
type MetalToneId = (typeof METAL_TONES)[number]["id"];

export type JewelColour = ColourId | MetalToneId;

interface JewelColourDef {
  readonly id: JewelColour;
  readonly name: string;
  readonly hex: string;
}

export const JEWEL_COLOURS: readonly JewelColourDef[] = [...COLOURS, ...METAL_TONES];

export function jewelColourById(id: JewelColour): JewelColourDef {
  const found = JEWEL_COLOURS.find((colour) => colour.id === id);
  if (found === undefined) throw new Error(`Missing colour in catalog: ${id}`);
  return found;
}

export const GLAZE_COLOURS = [
  "sky",
  "coral",
  "sage",
  "mustard",
  "lavender",
  "teal",
  "navy",
  "blush",
] as const;
export type GlazeColour = (typeof GLAZE_COLOURS)[number];

export function isGlazeColour(value: string): value is GlazeColour {
  return GLAZE_COLOURS.some((colour) => colour === value);
}
