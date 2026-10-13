export const DIFFICULTY_IDS = ["relaxed", "standard", "challenging"] as const;
export type DifficultyId = (typeof DIFFICULTY_IDS)[number];

export interface DifficultyDef {
  id: DifficultyId;
  name: string;
  description: string;
  rentMultiplier: number;
  toleranceMultiplier: number;
  minQualityBonus: number;
}

export const DIFFICULTIES: readonly DifficultyDef[] = [
  {
    id: "relaxed",
    name: "Relaxed",
    description: "No rent and no failed gigs. Every dress finds a happy owner.",
    rentMultiplier: 0,
    toleranceMultiplier: 1.3,
    minQualityBonus: 0,
  },
  {
    id: "standard",
    name: "Standard",
    description: "Rent is due weekly. A near miss still pays part of the fee, with kind feedback.",
    rentMultiplier: 1,
    toleranceMultiplier: 1,
    minQualityBonus: 0,
  },
  {
    id: "challenging",
    name: "Challenging",
    description:
      "Higher rent and pickier clients. A failed gig pays nothing and late work costs half the fee.",
    rentMultiplier: 1.5,
    toleranceMultiplier: 0.85,
    minQualityBonus: 6,
  },
];
