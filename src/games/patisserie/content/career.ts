import type { IngredientId } from "./ingredient";

export interface CareerDef {
  readonly name: string;
  readonly bakeryName: string;
  readonly street: string;
  readonly startCoins: number;
  readonly startReputation: number;
  readonly weeklyRent: number;
  readonly shiftName: string;
  readonly shiftPay: number;
  readonly starterPacks: Readonly<Partial<Record<IngredientId, number>>>;
}

export const CAREER: CareerDef = {
  name: "Corner Baker",
  bakeryName: "Crumb & Comet",
  street: "Larkspur Street",
  startCoins: 80,
  startReputation: 0,
  weeklyRent: 70,
  shiftName: "Washing trays at the café",
  shiftPay: 30,
  starterPacks: {
    flour: 2,
    "caster-sugar": 2,
    "icing-sugar": 1,
    butter: 2,
    milk: 1,
    eggs: 2,
    vanilla: 1,
  },
};
