import type { DifficultyId } from "./difficulty";

export const GRACE_COINS = 60;

export interface GraceTerms {
  readonly difficulty: DifficultyId;
  readonly coins: number;
  readonly graceSeason: number;
  readonly seasonNumber: number;
}

export function graceDue(terms: GraceTerms): boolean {
  return terms.difficulty === "standard" && terms.coins < 0 && terms.graceSeason < terms.seasonNumber;
}
