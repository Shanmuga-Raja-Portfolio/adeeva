import type { ColourId } from "../../../engine/palette";
import type { WoodTag } from "./woodTag";

export const FINISH_IDS = [
  "clear-oil",
  "beeswax",
  "whitewash",
  "deep-stain",
  "chalk-paint",
  "two-tone",
] as const;
export type FinishId = (typeof FINISH_IDS)[number];

type FinishLook = "wood" | "whitewash" | "stain" | "paint" | "two-tone";

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
