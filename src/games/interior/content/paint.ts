import type { RoomColour } from "./roomColour";
import type { RoomTag } from "./roomTag";

export const PAINT_IDS = [
  "chalk-white",
  "sea-glass",
  "morning-sky",
  "peach-sorbet",
  "sunflower",
  "lilac-mist",
  "deep-lagoon",
  "midnight-ink",
] as const;
export type PaintId = (typeof PAINT_IDS)[number];

export interface PaintDef {
  readonly id: PaintId;
  readonly name: string;
  readonly colour: RoomColour;
  readonly price: number;
  readonly tags: readonly RoomTag[];
}

export const PAINTS: readonly PaintDef[] = [
  { id: "chalk-white", name: "Chalk White", colour: "ivory", price: 5, tags: ["classic", "calm"] },
  { id: "sea-glass", name: "Sea Glass", colour: "sage", price: 5, tags: ["calm", "natural"] },
  { id: "morning-sky", name: "Morning Sky", colour: "sky", price: 5, tags: ["bright", "calm"] },
  { id: "peach-sorbet", name: "Peach Sorbet", colour: "coral", price: 6, tags: ["playful", "bright"] },
  { id: "sunflower", name: "Sunflower", colour: "mustard", price: 6, tags: ["bright", "playful"] },
  { id: "lilac-mist", name: "Lilac Mist", colour: "lavender", price: 6, tags: ["calm", "playful"] },
  { id: "deep-lagoon", name: "Deep Lagoon", colour: "teal", price: 7, tags: ["bold", "modern"] },
  { id: "midnight-ink", name: "Midnight Ink", colour: "navy", price: 7, tags: ["bold", "classic"] },
];
