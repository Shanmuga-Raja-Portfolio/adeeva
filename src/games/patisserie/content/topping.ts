import type { StyleTag } from "../../../engine/styleTag";

export const TOPPING_IDS = [
  "sprinkles",
  "sugar-rose",
  "fresh-berries",
  "party-candle",
  "choc-curls",
  "sugar-pearls",
  "wafer-butterfly",
  "gold-star",
  "team-ball",
] as const;
export type ToppingId = (typeof TOPPING_IDS)[number];

export interface ToppingDef {
  readonly id: ToppingId;
  readonly name: string;
  readonly price: number;
  readonly tags: readonly StyleTag[];
}

export const TOPPINGS: readonly ToppingDef[] = [
  { id: "sprinkles", name: "Rainbow Sprinkles", price: 3, tags: ["playful"] },
  { id: "sugar-rose", name: "Sugar Rose", price: 4, tags: ["romantic", "elegant"] },
  { id: "fresh-berries", name: "Fresh Berry", price: 2, tags: ["romantic", "casual"] },
  { id: "party-candle", name: "Party Candle", price: 1, tags: ["playful"] },
  { id: "choc-curls", name: "Chocolate Curls", price: 3, tags: ["bold", "edgy"] },
  { id: "sugar-pearls", name: "Sugar Pearls", price: 3, tags: ["elegant", "regal"] },
  { id: "wafer-butterfly", name: "Wafer Butterfly", price: 3, tags: ["dreamy"] },
  { id: "gold-star", name: "Gold Sugar Star", price: 4, tags: ["regal", "bold"] },
  { id: "team-ball", name: "Sugar Team Ball", price: 3, tags: ["sporty"] },
];
