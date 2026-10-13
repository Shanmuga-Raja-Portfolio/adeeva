export const DIFFICULTY_IDS = ["relaxed", "standard", "challenging"] as const;
export type DifficultyId = (typeof DIFFICULTY_IDS)[number];

export interface DifficultyRules {
  rentMultiplier: number;
  toleranceMultiplier: number;
  minQualityBonus: number;
}

export interface DifficultyText {
  id: DifficultyId;
  name: string;
  description: string;
}

export type DifficultyDef = DifficultyText & DifficultyRules;

export const DIFFICULTY_RULES: Readonly<Record<DifficultyId, DifficultyRules>> = {
  relaxed: { rentMultiplier: 0, toleranceMultiplier: 1.3, minQualityBonus: 0 },
  standard: { rentMultiplier: 1, toleranceMultiplier: 1, minQualityBonus: 0 },
  challenging: { rentMultiplier: 1.5, toleranceMultiplier: 0.85, minQualityBonus: 6 },
};

export function difficultyDef(text: DifficultyText): DifficultyDef {
  return { ...text, ...DIFFICULTY_RULES[text.id] };
}

export function weeklyRent(baseRent: number, difficulty: DifficultyId): number {
  return Math.round(baseRent * DIFFICULTY_RULES[difficulty].rentMultiplier);
}
