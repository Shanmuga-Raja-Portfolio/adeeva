export const LOFT_DECOR_IDS = ["swatch-wall", "loft-plant", "neon-sign"] as const;
export type LoftDecorId = (typeof LOFT_DECOR_IDS)[number];

export interface LoftDecorDef {
  readonly id: LoftDecorId;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly minReputation: number;
}

export const LOFT_DECOR: readonly LoftDecorDef[] = [
  {
    id: "swatch-wall",
    name: "Swatch Wall",
    description: "A rainbow of paint chips pinned above your table.",
    price: 40,
    minReputation: 0,
  },
  {
    id: "loft-plant",
    name: "Big Monstera",
    description: "A leafy friend by the loft window.",
    price: 80,
    minReputation: 0,
  },
  {
    id: "neon-sign",
    name: "Studio Sign",
    description: "A glowing sign with your studio's name.",
    price: 120,
    minReputation: 0,
  },
];
