import type { DifficultyId } from "./difficulty";

export const LATE_SHOW_PENALTY = 10;
export const SHOW_REPUTATION_FLOOR = 50;
export const BEST_MUSIC_POINTS = 70;
export const OTHER_MUSIC_POINTS = 20;
export const BEST_SETTING_POINTS = 30;
export const OTHER_SETTING_POINTS = 10;

export function lateShowPenalty(late: boolean, difficulty: DifficultyId): number {
  return late && difficulty !== "relaxed" ? LATE_SHOW_PENALTY : 0;
}

export function stagingScore(bestMusic: boolean, bestSetting: boolean): number {
  return (
    (bestMusic ? BEST_MUSIC_POINTS : OTHER_MUSIC_POINTS) +
    (bestSetting ? BEST_SETTING_POINTS : OTHER_SETTING_POINTS)
  );
}

export type ShowSetbacks = Readonly<Record<DifficultyId, number>>;

export const GENTLE_SHOW_SETBACKS: ShowSetbacks = { relaxed: 0, standard: 0, challenging: -1 };

export function showReputation(
  overall: number,
  difficulty: DifficultyId,
  setbacks: ShowSetbacks = GENTLE_SHOW_SETBACKS,
): number {
  if (overall >= SHOW_REPUTATION_FLOOR) return Math.round((overall - 40) / 6);
  return setbacks[difficulty];
}

export interface ShowDemandTerms {
  readonly floor: number;
  readonly step: number;
  readonly baseValue: number;
  readonly valuePerSeason: number;
  readonly seasonCap: number;
}

export interface ShowDemand {
  readonly count: number;
  readonly coins: number;
}

export function showDemand(overall: number, seasonNumber: number, terms: ShowDemandTerms): ShowDemand {
  const count = Math.max(0, Math.round((overall - terms.floor) / terms.step));
  const value = terms.baseValue + terms.valuePerSeason * (Math.min(seasonNumber, terms.seasonCap) - 1);
  return { count, coins: count * value };
}
