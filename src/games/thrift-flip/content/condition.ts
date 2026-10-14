export const CONDITION_GRADES = ["like-new", "loved", "tired"] as const;
export type ConditionGrade = (typeof CONDITION_GRADES)[number];

export interface ConditionDef {
  readonly id: ConditionGrade;
  readonly name: string;
  readonly condition: number;
  readonly priceMultiplier: number;
  readonly stains: number;
  readonly wornSpots: number;
  readonly weight: number;
}

export const CONDITIONS: readonly ConditionDef[] = [
  {
    id: "like-new",
    name: "Like New",
    condition: 0.9,
    priceMultiplier: 1,
    stains: 1,
    wornSpots: 0,
    weight: 25,
  },
  { id: "loved", name: "Loved", condition: 0.7, priceMultiplier: 0.75, stains: 2, wornSpots: 0, weight: 50 },
  { id: "tired", name: "Tired", condition: 0.5, priceMultiplier: 0.5, stains: 3, wornSpots: 1, weight: 25 },
];
