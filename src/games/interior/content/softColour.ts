import type { RoomColour } from "./roomColour";

export const SOFT_COLOURS = [
  "sky",
  "coral",
  "sage",
  "mustard",
  "lavender",
  "teal",
  "navy",
  "blush",
] as const satisfies readonly RoomColour[];

export type SoftColour = (typeof SOFT_COLOURS)[number];

export const DEFAULT_SOFT_COLOUR: SoftColour = "sage";
