import type { DifficultyId } from "../../../engine/difficulty";
import type { FairTentNumber } from "../content/fairTent";
import { RIBBONS, type RibbonId } from "../content/ribbon";

export const PRIZE_BASE = 30;
export const PRIZE_PER_TENT = 10;
export const PRIZE_PER_POINT = 3;
export const PRIZE_FLOOR = 50;
export const LATE_FAIR_PENALTY = 10;

export interface FairPrize {
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
}

export function ribbonFor(overall: number): RibbonId {
  return RIBBONS.reduce<RibbonId>((best, ribbon) => (overall >= ribbon.from ? ribbon.id : best), "bakers");
}

export function ribbonRank(ribbon: RibbonId): number {
  return RIBBONS.findIndex((entry) => entry.id === ribbon);
}

export function fairPrize(overall: number, tent: FairTentNumber, difficulty: DifficultyId): FairPrize {
  const reputation =
    overall >= PRIZE_FLOOR ? Math.round((overall - 40) / 6) : difficulty === "challenging" ? -1 : 0;
  return {
    coins: PRIZE_BASE + PRIZE_PER_TENT * tent + PRIZE_PER_POINT * Math.max(0, overall - PRIZE_FLOOR),
    reputation,
    buzz: Math.round(overall / 10),
  };
}

export function latePenalty(late: boolean, difficulty: DifficultyId): number {
  return late && difficulty !== "relaxed" ? LATE_FAIR_PENALTY : 0;
}

export function tentAdvanceMark(difficulty: DifficultyId): number {
  return difficulty === "challenging" ? 65 : 60;
}
