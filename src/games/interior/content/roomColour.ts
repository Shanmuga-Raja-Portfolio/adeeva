import { COLOURS } from "../../../engine/palette";

const WOOD_TONES = [
  { id: "pale-wood", name: "Pale wood", hex: "#e3c79a" },
  { id: "honey-wood", name: "Honey wood", hex: "#c8914f" },
  { id: "red-wood", name: "Red wood", hex: "#9c4a2f" },
  { id: "dark-wood", name: "Dark wood", hex: "#5e3b25" },
] as const;

const ROOM_COLOURS = [...COLOURS, ...WOOD_TONES] as const;

export type RoomColour = (typeof ROOM_COLOURS)[number]["id"];

interface RoomColourDef {
  readonly id: RoomColour;
  readonly name: string;
  readonly hex: string;
}

export const ROOM_COLOUR_IDS: readonly RoomColour[] = ROOM_COLOURS.map((colour) => colour.id);

export function roomColourById(id: RoomColour): RoomColourDef {
  const found = ROOM_COLOURS.find((colour) => colour.id === id);
  if (found === undefined) throw new Error(`Missing room colour: ${id}`);
  return found;
}
