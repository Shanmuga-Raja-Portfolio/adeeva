import type { DifficultyId } from "../../../engine/difficulty";
import { GENTLE_SHOW_SETBACKS, showReputation } from "../../../engine/showDay";
import type { AwardId } from "../content/launchAward";
import { LAUNCH_SPOT_NUMBERS, type LaunchSpotNumber } from "../content/launchSpot";
import { awardFor } from "./lanternGarland";

export const SPOT_STEP_MARK = 70;
export const CHALLENGING_SPOT_STEP_MARK = 75;
export const RELAXED_SPOT_OFFER_MARK = 55;
const LAST_SPOT: LaunchSpotNumber = 4;

export interface LaunchPrize {
  readonly award: AwardId;
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
  readonly spotAfter: LaunchSpotNumber;
  readonly spotOffer: boolean;
}

function nextSpot(spot: LaunchSpotNumber): LaunchSpotNumber {
  return LAUNCH_SPOT_NUMBERS.find((number) => number === spot + 1) ?? LAST_SPOT;
}

export function spotSteps(overall: number, difficulty: DifficultyId): boolean {
  if (difficulty === "relaxed") return false;
  return overall >= (difficulty === "challenging" ? CHALLENGING_SPOT_STEP_MARK : SPOT_STEP_MARK);
}

export function launchPrize(overall: number, spot: LaunchSpotNumber, difficulty: DifficultyId): LaunchPrize {
  const steps = spotSteps(overall, difficulty);
  return {
    award: awardFor(overall),
    coins: 25 + 15 * spot + 4 * Math.max(0, overall - 50),
    reputation: showReputation(overall, difficulty, GENTLE_SHOW_SETBACKS),
    buzz: Math.round(overall / 10),
    spotAfter: steps ? nextSpot(spot) : spot,
    spotOffer: difficulty === "relaxed" && overall >= RELAXED_SPOT_OFFER_MARK && spot < LAST_SPOT,
  };
}

export function biggerSpot(spot: LaunchSpotNumber): LaunchSpotNumber {
  return nextSpot(spot);
}
