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
  "rose-quartz",
  "turquoise",
  "lapis",
  "sunstone",
  "tiger-eye",
  "topaz",
  "rose-garnet",
  "plum-glass",
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
  {
    id: "rose-quartz",
    name: "Rose Quartz",
    price: 5,
    colour: "blush",
    cut: "round",
    tags: ["dainty", "dreamy"],
    minReputation: 14,
  },
  {
    id: "turquoise",
    name: "Turquoise",
    price: 5,
    colour: "teal",
    cut: "round",
    tags: ["nature", "playful"],
    minReputation: 14,
  },
  {
    id: "lapis",
    name: "Lapis",
    price: 6,
    colour: "navy",
    cut: "oval",
    tags: ["classic", "dreamy"],
    minReputation: 16,
  },
  {
    id: "sunstone",
    name: "Sunstone",
    price: 6,
    colour: "coral",
    cut: "teardrop",
    tags: ["bold", "sparkly"],
    minReputation: 18,
  },
  {
    id: "tiger-eye",
    name: "Tiger Eye",
    price: 5,
    colour: "gold",
    cut: "square",
    tags: ["bold", "nature"],
    minReputation: 20,
  },
  {
    id: "topaz",
    name: "Topaz",
    price: 7,
    colour: "sky",
    cut: "teardrop",
    tags: ["elegant", "sparkly"],
    minReputation: 24,
  },
  {
    id: "rose-garnet",
    name: "Rose Garnet",
    price: 7,
    colour: "rose",
    cut: "oval",
    tags: ["elegant", "dreamy"],
    minReputation: 26,
  },
  {
    id: "plum-glass",
    name: "Plum Glass",
    price: 4,
    colour: "plum",
    cut: "square",
    tags: ["dreamy", "bold"],
    minReputation: 14,
  },
];
