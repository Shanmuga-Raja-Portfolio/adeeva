import type { ColourId } from "../../../engine/palette";
import type { JewelTag } from "./jewelTag";

export const STONE_IDS = [
  "sky-glass",
  "sea-glass",
  "garnet",
  "citrine",
  "peridot",
  "onyx",
  "amethyst",
  "moonstone",
] as const;
export type StoneId = (typeof STONE_IDS)[number];

export const STONE_CUTS = ["round", "oval", "square", "teardrop"] as const;
export type StoneCut = (typeof STONE_CUTS)[number];

export interface StoneDef {
  readonly id: StoneId;
  readonly name: string;
  readonly price: number;
  readonly colour: ColourId;
  readonly cut: StoneCut;
  readonly tags: readonly JewelTag[];
  readonly minReputation: number;
}

export const STONES: readonly StoneDef[] = [
  {
    id: "sky-glass",
    name: "Sky Glass",
    price: 2,
    colour: "sky",
    cut: "round",
    tags: ["playful"],
    minReputation: 0,
  },
  {
    id: "sea-glass",
    name: "Sea Glass",
    price: 3,
    colour: "sage",
    cut: "oval",
    tags: ["nature", "dreamy"],
    minReputation: 0,
  },
  {
    id: "garnet",
    name: "Garnet",
    price: 6,
    colour: "ruby",
    cut: "round",
    tags: ["classic", "elegant"],
    minReputation: 0,
  },
  {
    id: "citrine",
    name: "Citrine",
    price: 5,
    colour: "mustard",
    cut: "square",
    tags: ["bold", "sparkly"],
    minReputation: 6,
  },
  {
    id: "peridot",
    name: "Peridot",
    price: 5,
    colour: "emerald",
    cut: "teardrop",
    tags: ["nature", "sparkly"],
    minReputation: 6,
  },
  {
    id: "onyx",
    name: "Onyx",
    price: 5,
    colour: "black",
    cut: "square",
    tags: ["bold", "classic"],
    minReputation: 10,
  },
  {
    id: "amethyst",
    name: "Amethyst",
    price: 6,
    colour: "lavender",
    cut: "oval",
    tags: ["dreamy", "elegant"],
    minReputation: 14,
  },
  {
    id: "moonstone",
    name: "Moonstone",
    price: 7,
    colour: "ivory",
    cut: "teardrop",
    tags: ["dreamy", "dainty"],
    minReputation: 14,
  },
];
