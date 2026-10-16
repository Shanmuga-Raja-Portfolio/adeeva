import type { CareerId } from "./career";

export const LOFT_DECOR_IDS = [
  "swatch-wall",
  "loft-plant",
  "neon-sign",
  "street-map",
  "key-hooks",
  "cabin-bunting",
] as const;
export type LoftDecorId = (typeof LOFT_DECOR_IDS)[number];

export interface LoftDecorDef {
  readonly id: LoftDecorId;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly minReputation: number;
  readonly career: CareerId | null;
}

export const LOFT_DECOR: readonly LoftDecorDef[] = [
  {
    id: "swatch-wall",
    name: "Swatch Wall",
    description: "A rainbow of paint chips pinned above your table.",
    price: 40,
    minReputation: 0,
    career: null,
  },
  {
    id: "loft-plant",
    name: "Big Monstera",
    description: "A leafy friend by the loft window.",
    price: 80,
    minReputation: 0,
    career: null,
  },
  {
    id: "neon-sign",
    name: "Studio Sign",
    description: "A glowing sign with your studio's name.",
    price: 120,
    minReputation: 0,
    career: null,
  },
  {
    id: "street-map",
    name: "Street Map",
    description: "A hand-drawn map of Larkspur Close for the cabin wall.",
    price: 50,
    minReputation: 0,
    career: "development",
  },
  {
    id: "key-hooks",
    name: "Brass Key Hooks",
    description: "Shiny hooks that make the Key Wall sparkle.",
    price: 90,
    minReputation: 0,
    career: "development",
  },
  {
    id: "cabin-bunting",
    name: "Cabin Bunting",
    description: "Cheerful flags strung across the site cabin.",
    price: 40,
    minReputation: 0,
    career: "development",
  },
];
