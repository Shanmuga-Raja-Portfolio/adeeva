import type { DifficultyId } from "../../../engine/difficulty";
import { showReputation } from "../../../engine/showDay";
import type { FairTentNumber } from "../content/fairTent";
import { RIBBONS, type RibbonId } from "../content/ribbon";

export const PRIZE_BASE = 30;
export const PRIZE_PER_TENT = 10;
export const PRIZE_PER_POINT = 3;
export const PRIZE_FLOOR = 50;

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
  return {
    coins: PRIZE_BASE + PRIZE_PER_TENT * tent + PRIZE_PER_POINT * Math.max(0, overall - PRIZE_FLOOR),
    reputation: showReputation(overall, difficulty),
    buzz: Math.round(overall / 10),
  };
}

export function tentAdvanceMark(difficulty: DifficultyId): number {
  return difficulty === "challenging" ? 65 : 60;
}
