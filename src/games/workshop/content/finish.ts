import type { ColourId } from "../../../engine/palette";
import type { WoodTag } from "./woodTag";

export const FINISH_IDS = [
  "clear-oil",
  "beeswax",
  "whitewash",
  "deep-stain",
  "chalk-paint",
  "two-tone",
  "milk-paint",
  "limed-wax",
  "colour-wash",
  "midnight-stain",
] as const;
export type FinishId = (typeof FINISH_IDS)[number];

type FinishLook =
  "wood" | "whitewash" | "stain" | "paint" | "two-tone" | "milk" | "limed" | "wash" | "midnight";

export interface FinishDef {
  readonly id: FinishId;
  readonly name: string;
  readonly price: number;
  readonly tags: readonly WoodTag[];
  readonly look: FinishLook;
  readonly needsPaint: boolean;
  readonly blurb: string;
}

export const FINISHES: readonly FinishDef[] = [
  {
    id: "clear-oil",
    name: "Clear Oil",
    price: 4,
    tags: ["natural"],
    look: "wood",
    needsPaint: false,
    blurb: "Shows off the wood lines.",
  },
  {
    id: "beeswax",
    name: "Beeswax Polish",
    price: 5,
    tags: ["cosy", "classic"],
    look: "wood",
    needsPaint: false,
    blurb: "A soft, warm glow.",
  },
  {
    id: "whitewash",
    name: "Whitewash",
    price: 5,
    tags: ["rustic"],
    look: "whitewash",
    needsPaint: false,
    blurb: "A milky wash over the wood.",
  },
  {
    id: "deep-stain",
    name: "Deep Stain",
    price: 6,
    tags: ["elegant"],
    look: "stain",
    needsPaint: false,
    blurb: "Dark and rich, like old furniture.",
  },
  {
    id: "chalk-paint",
    name: "Chalk Paint",
    price: 6,
    tags: ["playful"],
    look: "paint",
    needsPaint: true,
    blurb: "One bright colour all over.",
  },
  {
    id: "two-tone",
    name: "Two-Tone",
    price: 8,
    tags: ["modern"],
    look: "two-tone",
    needsPaint: true,
    blurb: "Painted frame, wood showing on top.",
  },
  {
    id: "milk-paint",
    name: "Milk Paint",
    price: 6,
    tags: ["rustic", "playful"],
    look: "milk",
    needsPaint: true,
    blurb: "A soft, chalky colour.",
  },
  {
    id: "limed-wax",
    name: "Limed Wax",
    price: 6,
    tags: ["natural", "rustic"],
    look: "limed",
    needsPaint: false,
    blurb: "Pale wax resting in the wood lines.",
  },
  {
    id: "colour-wash",
    name: "Colour Wash",
    price: 7,
    tags: ["cosy", "playful"],
    look: "wash",
    needsPaint: true,
    blurb: "A see-through tint over the wood.",
  },
  {
    id: "midnight-stain",
    name: "Midnight Stain",
    price: 7,
    tags: ["elegant", "modern"],
    look: "midnight",
    needsPaint: false,
    blurb: "Deep charcoal, like the night sky.",
  },
];

export const PAINT_COLOURS: readonly ColourId[] = [
  "sky",
  "coral",
  "sage",
  "mustard",
  "lavender",
  "teal",
  "navy",
  "blush",
];
