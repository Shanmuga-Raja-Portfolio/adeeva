import type { ProductId } from "./product";

export const SET_TEMPLATE_IDS = [
  "reading-corner",
  "hallway-welcome",
  "cottage-bedroom",
  "breakfast-nook",
  "garden-corner",
  "playroom",
  "family-table",
  "guest-room",
] as const;
export type SetTemplateId = (typeof SET_TEMPLATE_IDS)[number];

export interface SetTemplateDef {
  readonly id: SetTemplateId;
  readonly name: string;
  readonly blurb: string;
  readonly pieces: readonly ProductId[];
  readonly matchablePairs: number;
}

export const SET_TEMPLATES: readonly SetTemplateDef[] = [
  {
    id: "reading-corner",
    name: "Reading Corner",
    blurb: "A bookshelf and a footstool for long stories.",
    pieces: ["bookshelf", "footstool"],
    matchablePairs: 1,
  },
  {
    id: "hallway-welcome",
    name: "Hallway Welcome",
    blurb: "A coat rack and a footstool by the front door.",
    pieces: ["coat-rack", "footstool"],
    matchablePairs: 1,
  },
  {
    id: "cottage-bedroom",
    name: "Cottage Bedroom",
    blurb: "A low bed and a bedside table, snug as a nest.",
    pieces: ["cottage-bed", "bedside-table"],
    matchablePairs: 0,
  },
  {
    id: "breakfast-nook",
    name: "Breakfast Nook",
    blurb: "A table and two chairs for toast and chatter.",
    pieces: ["breakfast-table", "dining-chair", "dining-chair"],
    matchablePairs: 2,
  },
  {
    id: "garden-corner",
    name: "Garden Corner",
    blurb: "A window bench and two planter boxes.",
    pieces: ["window-bench", "planter-box", "planter-box"],
    matchablePairs: 2,
  },
  {
    id: "playroom",
    name: "Playroom Pals",
    blurb: "A toy chest, a step stool and a bookshelf.",
    pieces: ["toy-chest", "step-stool", "bookshelf"],
    matchablePairs: 1,
  },
  {
    id: "family-table",
    name: "Family Table",
    blurb: "A table and three chairs for the whole family.",
    pieces: ["breakfast-table", "dining-chair", "dining-chair", "dining-chair"],
    matchablePairs: 3,
  },
  {
    id: "guest-room",
    name: "Guest Room",
    blurb: "A bed, two bedside tables and a wall cupboard.",
    pieces: ["cottage-bed", "bedside-table", "bedside-table", "wall-cupboard"],
    matchablePairs: 1,
  },
];
