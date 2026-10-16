import type { DifficultyId } from "../../../engine/difficulty";
import { showReputation } from "../../../engine/showDay";
import type { FairBoothNumber } from "../content/fairBooth";
import { ROSETTES, type RosetteId } from "../content/rosette";

export const PRIZE_BASE = 25;
export const PRIZE_PER_BOOTH = 10;
export const PRIZE_PER_POINT = 3;
export const PRIZE_FLOOR = 50;

export interface FairPrize {
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
}

export function rosetteFor(overall: number): RosetteId {
  return ROSETTES.reduce<RosetteId>(
    (best, rosette) => (overall >= rosette.from ? rosette.id : best),
    "makers-ribbon",
  );
}

export function rosetteRank(rosette: RosetteId): number {
  return ROSETTES.findIndex((entry) => entry.id === rosette);
}

export function fairPrize(overall: number, booth: FairBoothNumber, difficulty: DifficultyId): FairPrize {
  return {
    coins: PRIZE_BASE + PRIZE_PER_BOOTH * booth + PRIZE_PER_POINT * Math.max(0, overall - PRIZE_FLOOR),
    reputation: showReputation(overall, difficulty),
    buzz: Math.round(overall / 10),
  };
}

export function boothAdvanceMark(difficulty: DifficultyId): number {
  return difficulty === "challenging" ? 65 : 60;
}
