import type { ProductId } from "./product";
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
  "cup-handle",
  "ceramic-knob",
  "rope-handle",
  "brass-corners",
  "little-wheels",
  "heart-carving",
  "moon-stencil",
  "bird-carving",
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
  readonly notOn: readonly ProductId[];
}

export const SEAT_AND_STEP_PRODUCTS: readonly ProductId[] = [
  "step-stool",
  "footstool",
  "dining-chair",
  "window-bench",
];

export const EXTRAS: readonly ExtraDef[] = [
  { id: "brass-knob", name: "Brass Knob", price: 4, tags: ["elegant", "classic"], colour: "gold", notOn: [] },
  { id: "wood-knob", name: "Wooden Knob", price: 2, tags: ["cosy", "natural"], colour: "wood", notOn: [] },
  { id: "leather-pull", name: "Leather Pull", price: 3, tags: ["rustic"], colour: null, notOn: [] },
  { id: "coat-hook", name: "Iron Hook", price: 3, tags: ["sturdy"], colour: "charcoal", notOn: [] },
  { id: "brass-hinge", name: "Brass Hinge", price: 3, tags: ["classic"], colour: "gold", notOn: [] },
  { id: "name-plaque", name: "Name Plaque", price: 5, tags: ["cosy", "playful"], colour: "ivory", notOn: [] },
  { id: "star-stencil", name: "Star Stencil", price: 2, tags: ["playful"], colour: "gold", notOn: [] },
  { id: "leaf-carving", name: "Carved Leaf", price: 4, tags: ["natural", "rustic"], colour: null, notOn: [] },
  {
    id: "cup-handle",
    name: "Cup Handle",
    price: 4,
    tags: ["classic", "modern"],
    colour: "charcoal",
    notOn: [],
  },
  { id: "ceramic-knob", name: "Painted Knob", price: 3, tags: ["playful", "cosy"], colour: "sky", notOn: [] },
  { id: "rope-handle", name: "Rope Handle", price: 3, tags: ["rustic", "natural"], colour: null, notOn: [] },
  {
    id: "brass-corners",
    name: "Brass Corners",
    price: 5,
    tags: ["elegant", "sturdy"],
    colour: "gold",
    notOn: [],
  },
  {
    id: "little-wheels",
    name: "Little Wheels",
    price: 4,
    tags: ["playful", "sturdy"],
    colour: "charcoal",
    notOn: SEAT_AND_STEP_PRODUCTS,
  },
  { id: "heart-carving", name: "Carved Heart", price: 4, tags: ["cosy", "playful"], colour: null, notOn: [] },
  {
    id: "moon-stencil",
    name: "Moon Stencil",
    price: 2,
    tags: ["elegant", "playful"],
    colour: "gold",
    notOn: [],
  },
  {
    id: "bird-carving",
    name: "Carved Bird",
    price: 4,
    tags: ["natural", "playful"],
    colour: null,
    notOn: [],
  },
];
