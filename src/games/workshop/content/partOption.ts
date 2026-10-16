import type { WoodTag } from "./woodTag";

export const PART_SLOTS = ["edge", "legs", "accent"] as const;
export type PartSlot = (typeof PART_SLOTS)[number];

export const PART_OPTION_IDS = [
  "square-edge",
  "rounded-edge",
  "arched-edge",
  "straight-legs",
  "tapered-legs",
  "splayed-legs",
  "no-accent",
  "star-cutout",
  "leaf-cutout",
  "slats",
  "clipped-corners",
  "scallop-edge",
  "block-legs",
  "sled-legs",
  "heart-cutout",
  "moon-cutout",
] as const;
export type PartOptionId = (typeof PART_OPTION_IDS)[number];

export interface PartOptionDef {
  readonly id: PartOptionId;
  readonly slot: PartSlot;
  readonly name: string;
  readonly tags: readonly WoodTag[];
  readonly sawNote: string;
}

export const PART_OPTIONS: readonly PartOptionDef[] = [
  {
    id: "square-edge",
    slot: "edge",
    name: "Square edges",
    tags: ["classic", "sturdy"],
    sawNote: "Straight lines only",
  },
  {
    id: "rounded-edge",
    slot: "edge",
    name: "Rounded corners",
    tags: ["cosy", "playful"],
    sawNote: "Four curvy corners",
  },
  {
    id: "arched-edge",
    slot: "edge",
    name: "Gentle arch",
    tags: ["elegant"],
    sawNote: "One long curve on top",
  },
  { id: "straight-legs", slot: "legs", name: "Straight legs", tags: ["sturdy"], sawNote: "Straight lines" },
  {
    id: "tapered-legs",
    slot: "legs",
    name: "Tapered legs",
    tags: ["modern", "elegant"],
    sawNote: "Two long slanted lines",
  },
  {
    id: "splayed-legs",
    slot: "legs",
    name: "Splayed legs",
    tags: ["rustic", "playful"],
    sawNote: "Angled ends and tilted joints",
  },
  { id: "no-accent", slot: "accent", name: "Plain", tags: ["classic"], sawNote: "Nothing extra" },
  { id: "star-cutout", slot: "accent", name: "Star cut-out", tags: ["playful"], sawNote: "A pointy star" },
  { id: "leaf-cutout", slot: "accent", name: "Leaf cut-out", tags: ["natural"], sawNote: "A curvy leaf" },
  { id: "slats", slot: "accent", name: "Slatted panel", tags: ["modern"], sawNote: "Three extra lines" },
  {
    id: "clipped-corners",
    slot: "edge",
    name: "Clipped corners",
    tags: ["modern", "classic"],
    sawNote: "Four short corner cuts",
  },
  {
    id: "scallop-edge",
    slot: "edge",
    name: "Scalloped edge",
    tags: ["playful", "cosy"],
    sawNote: "Five little bumps on top",
  },
  {
    id: "block-legs",
    slot: "legs",
    name: "Block legs",
    tags: ["sturdy", "modern"],
    sawNote: "A square notch at each foot",
  },
  {
    id: "sled-legs",
    slot: "legs",
    name: "Sled legs",
    tags: ["rustic", "modern"],
    sawNote: "A curved runner on each foot",
  },
  {
    id: "heart-cutout",
    slot: "accent",
    name: "Heart cut-out",
    tags: ["cosy", "playful"],
    sawNote: "A round little heart",
  },
  {
    id: "moon-cutout",
    slot: "accent",
    name: "Moon cut-out",
    tags: ["elegant", "playful"],
    sawNote: "A crescent moon",
  },
];

export const SLOT_NAMES: Readonly<Record<PartSlot, string>> = {
  edge: "Edges",
  legs: "Legs",
  accent: "Accent",
};
