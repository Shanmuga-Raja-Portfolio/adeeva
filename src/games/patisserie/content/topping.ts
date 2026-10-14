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
  "candied-orange",
  "sugar-shimmer",
  "mint-leaf",
  "sugar-daisy",
  "wafer-fan",
  "marzipan-bee",
  "choc-sail",
  "sugar-snowflake",
  "toffee-shard",
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
  { id: "candied-orange", name: "Candied Orange", price: 3, tags: ["playful", "bold"] },
  { id: "sugar-shimmer", name: "Sugar Shimmer", price: 3, tags: ["dreamy", "regal"] },
  { id: "mint-leaf", name: "Mint Leaf", price: 2, tags: ["casual", "elegant"] },
  { id: "sugar-daisy", name: "Sugar Daisy", price: 3, tags: ["playful", "romantic"] },
  { id: "wafer-fan", name: "Wafer Fan", price: 3, tags: ["elegant", "classic"] },
  { id: "marzipan-bee", name: "Marzipan Bee", price: 4, tags: ["playful", "dreamy"] },
  { id: "choc-sail", name: "Chocolate Sail", price: 4, tags: ["bold", "elegant"] },
  { id: "sugar-snowflake", name: "Sugar Snowflake", price: 3, tags: ["dreamy", "elegant"] },
  { id: "toffee-shard", name: "Toffee Shard", price: 3, tags: ["bold", "classic"] },
];
