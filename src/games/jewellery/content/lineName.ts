export const LINE_NAME_IDS = [
  "little-lantern",
  "moon-and-thimble",
  "brass-sparrow",
  "sea-pebble",
  "velvet-comet",
  "glimmer-lane",
  "wild-clover",
  "starling-row",
] as const;
export type LineNameId = (typeof LINE_NAME_IDS)[number];

export interface LineNameDef {
  readonly id: LineNameId;
  readonly name: string;
}

export const LINE_NAMES: readonly LineNameDef[] = [
  { id: "little-lantern", name: "Little Lantern" },
  { id: "moon-and-thimble", name: "Moon & Thimble" },
  { id: "brass-sparrow", name: "Brass Sparrow" },
  { id: "sea-pebble", name: "Sea Pebble" },
  { id: "velvet-comet", name: "Velvet Comet" },
  { id: "glimmer-lane", name: "Glimmer Lane" },
  { id: "wild-clover", name: "Wild Clover" },
  { id: "starling-row", name: "Starling Row" },
];
