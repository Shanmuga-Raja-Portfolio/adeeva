import type { ProductId } from "./product";

export const FAIR_TENT_NUMBERS = [1, 2, 3, 4, 5] as const;
export type FairTentNumber = (typeof FAIR_TENT_NUMBERS)[number];

export interface FairTentDef {
  readonly tent: FairTentNumber;
  readonly name: string;
  readonly products: readonly ProductId[];
  readonly readyMark: number;
  readonly themeToppings: number;
  readonly budget: number;
  readonly extraTable: boolean;
}

export const FAIR_TENTS: readonly FairTentDef[] = [
  {
    tent: 1,
    name: "Village Table",
    products: ["layer-cake", "biscuit-wreath", "tartlet-set"],
    readyMark: 72,
    themeToppings: 2,
    budget: 95,
    extraTable: false,
  },
  {
    tent: 2,
    name: "Garden Tent",
    products: ["two-tier-cake", "biscuit-wreath", "spiral-roll"],
    readyMark: 74,
    themeToppings: 2,
    budget: 110,
    extraTable: false,
  },
  {
    tent: 3,
    name: "Glasshouse Hall",
    products: ["two-tier-cake", "three-tier-cake"],
    readyMark: 76,
    themeToppings: 3,
    budget: 125,
    extraTable: true,
  },
  {
    tent: 4,
    name: "Lantern Pavilion",
    products: ["two-tier-cake", "three-tier-cake"],
    readyMark: 78,
    themeToppings: 3,
    budget: 140,
    extraTable: true,
  },
  {
    tent: 5,
    name: "Grand Glasshouse",
    products: ["three-tier-cake"],
    readyMark: 80,
    themeToppings: 4,
    budget: 155,
    extraTable: true,
  },
];
