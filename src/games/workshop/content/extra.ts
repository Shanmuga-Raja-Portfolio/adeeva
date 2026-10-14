import type { ShadeId } from "./shade";
import type { WoodTag } from "./woodTag";

export const EXTRA_IDS = [
  "brass-knob",
  "wood-knob",
  "leather-pull",
  "coat-hook",
  "brass-hinge",
  "name-plaque",
  "star-stencil",
  "leaf-carving",
] as const;
export type ExtraId = (typeof EXTRA_IDS)[number];

export interface ExtraNeed {
  readonly extra: ExtraId;
  readonly count: number;
}

type ExtraColour = ShadeId | "wood" | null;

export interface ExtraDef {
  readonly id: ExtraId;
  readonly name: string;
  readonly price: number;
  readonly tags: readonly WoodTag[];
  readonly colour: ExtraColour;
}

export const EXTRAS: readonly ExtraDef[] = [
  { id: "brass-knob", name: "Brass Knob", price: 4, tags: ["elegant", "classic"], colour: "gold" },
  { id: "wood-knob", name: "Wooden Knob", price: 2, tags: ["cosy", "natural"], colour: "wood" },
  { id: "leather-pull", name: "Leather Pull", price: 3, tags: ["rustic"], colour: null },
  { id: "coat-hook", name: "Iron Hook", price: 3, tags: ["sturdy"], colour: "charcoal" },
  { id: "brass-hinge", name: "Brass Hinge", price: 3, tags: ["classic"], colour: "gold" },
  { id: "name-plaque", name: "Name Plaque", price: 5, tags: ["cosy", "playful"], colour: "ivory" },
  { id: "star-stencil", name: "Star Stencil", price: 2, tags: ["playful"], colour: "gold" },
  { id: "leaf-carving", name: "Carved Leaf", price: 4, tags: ["natural", "rustic"], colour: null },
];
