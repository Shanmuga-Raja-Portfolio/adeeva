import type { JewelTag } from "./jewelTag";

export const OPTION_SLOTS = ["shape", "band", "accent"] as const;
export type OptionSlot = (typeof OPTION_SLOTS)[number];

export const SHAPE_IDS = [
  "circle",
  "heart",
  "leaf",
  "raindrop",
  "crescent",
  "star",
  "shell",
  "flower",
  "wave",
  "lantern",
] as const;
export type ShapeId = (typeof SHAPE_IDS)[number];

export const BAND_IDS = ["smooth-band", "wavy-band", "hammered-band", "twist-band", "beaded-band"] as const;
export type BandId = (typeof BAND_IDS)[number];

export const ACCENT_IDS = ["plain", "star-window", "dot-row", "moon-window", "heart-window"] as const;
export type AccentId = (typeof ACCENT_IDS)[number];

export const OPTION_IDS = [...SHAPE_IDS, ...BAND_IDS, ...ACCENT_IDS] as const;
export type OptionId = (typeof OPTION_IDS)[number];

export interface OptionDef {
  readonly id: OptionId;
  readonly slot: OptionSlot;
  readonly name: string;
  readonly tags: readonly JewelTag[];
  readonly cutting: string;
}

export const OPTIONS: readonly OptionDef[] = [
  { id: "circle", slot: "shape", name: "Circle", tags: ["classic"], cutting: "One smooth curve" },
  { id: "heart", slot: "shape", name: "Heart", tags: ["playful"], cutting: "Two curves, one turn" },
  { id: "leaf", slot: "shape", name: "Leaf", tags: ["nature"], cutting: "Two long curves" },
  {
    id: "raindrop",
    slot: "shape",
    name: "Raindrop",
    tags: ["dainty", "elegant"],
    cutting: "One curve, one turn",
  },
  {
    id: "crescent",
    slot: "shape",
    name: "Crescent Moon",
    tags: ["dreamy"],
    cutting: "Two curves, two turns",
  },
  {
    id: "star",
    slot: "shape",
    name: "Star",
    tags: ["sparkly", "playful"],
    cutting: "Ten edges, ten turns",
  },
  {
    id: "shell",
    slot: "shape",
    name: "Shell",
    tags: ["nature", "dainty"],
    cutting: "Three scallops, one turn",
  },
  {
    id: "flower",
    slot: "shape",
    name: "Five Petals",
    tags: ["nature", "playful"],
    cutting: "Five curves, five turns",
  },
  { id: "wave", slot: "shape", name: "Wave", tags: ["bold", "nature"], cutting: "One S-curve, two turns" },
  {
    id: "lantern",
    slot: "shape",
    name: "Little Lantern",
    tags: ["dreamy", "classic"],
    cutting: "A round body and a top tab",
  },
  { id: "smooth-band", slot: "band", name: "Smooth Band", tags: ["classic"], cutting: "A straight strip" },
  { id: "wavy-band", slot: "band", name: "Wavy Edge", tags: ["playful"], cutting: "Wavy long edges" },
  {
    id: "hammered-band",
    slot: "band",
    name: "Hammered Band",
    tags: ["bold", "nature"],
    cutting: "A straight strip with dimples",
  },
  {
    id: "twist-band",
    slot: "band",
    name: "Twist Band",
    tags: ["bold", "playful"],
    cutting: "Wavy edges that zig and zag",
  },
  {
    id: "beaded-band",
    slot: "band",
    name: "Beaded Edge",
    tags: ["dainty"],
    cutting: "A straight strip of beads",
  },
  { id: "plain", slot: "accent", name: "Plain", tags: ["classic"], cutting: "Nothing extra" },
  {
    id: "star-window",
    slot: "accent",
    name: "Star Window",
    tags: ["dreamy"],
    cutting: "A tiny star inside",
  },
  { id: "dot-row", slot: "accent", name: "Dot Row", tags: ["dainty"], cutting: "Three tiny circles inside" },
  { id: "moon-window", slot: "accent", name: "Moon Window", tags: ["dreamy"], cutting: "A tiny moon inside" },
  {
    id: "heart-window",
    slot: "accent",
    name: "Heart Window",
    tags: ["playful"],
    cutting: "A tiny heart inside",
  },
];
