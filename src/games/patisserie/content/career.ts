import type { IngredientId } from "./ingredient";

export const CAREER_IDS = ["bakery", "salon"] as const;
export type CareerId = (typeof CAREER_IDS)[number];

export interface CareerDef {
  readonly id: CareerId;
  readonly name: string;
  readonly pitch: string;
  readonly placeName: string;
  readonly startCoins: number;
  readonly startReputation: number;
  readonly weeklyRent: number;
  readonly rentLabel: string;
  readonly shiftName: string;
  readonly shiftLine: string;
  readonly shiftPay: number;
  readonly starterMultiplier: number;
}

export const BAKERY_NAME = "Crumb & Comet";
export const SALON_NAME = "The Comet Room";

export const STARTER_PACKS: Readonly<Partial<Record<IngredientId, number>>> = {
  flour: 2,
  "caster-sugar": 2,
  "icing-sugar": 1,
  butter: 2,
  milk: 1,
  eggs: 2,
  vanilla: 1,
};

export const CAREERS: readonly CareerDef[] = [
  {
    id: "bakery",
    name: "Corner Baker",
    pitch: "Start small: neighbours' orders and Counter Day. Great for first-time bakers.",
    placeName: BAKERY_NAME,
    startCoins: 80,
    startReputation: 0,
    weeklyRent: 70,
    rentLabel: "Bakery rent",
    shiftName: "Washing trays at the café",
    shiftLine: "You washed trays at the café",
    shiftPay: 30,
    starterMultiplier: 1,
  },
  {
    id: "salon",
    name: "Salon Pâtissier",
    pitch: "For bakers who already know the oven: tea salon and the Fair.",
    placeName: SALON_NAME,
    startCoins: 400,
    startReputation: 30,
    weeklyRent: 100,
    rentLabel: "Bakery and parlour rent",
    shiftName: "Setting up tables at the glasshouse",
    shiftLine: "You set up tables at the glasshouse",
    shiftPay: 45,
    starterMultiplier: 2,
  },
];
