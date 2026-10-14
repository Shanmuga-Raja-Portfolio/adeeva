import type { AwardId } from "../content/award";
import { CAREER } from "../content/career";
import { CUISINE_IDS, type CuisineId } from "../content/cuisine";
import { DISHES, type Dish, type DishDef, type UnlockLevel } from "../content/dish";
import type { GameState, Mastery } from "./gameState";

export const MAX_MASTERY = 99;

export function masteryLevel(points: number): UnlockLevel {
  if (points >= CAREER.expertMastery) return "expert";
  return points >= CAREER.confidentMastery ? "confident" : "learner";
}

const LEVEL_RANK: Readonly<Record<UnlockLevel, number>> = { learner: 0, confident: 1, expert: 2 };

export function isDishUnlocked(mastery: Mastery, dish: DishDef): boolean {
  return LEVEL_RANK[masteryLevel(mastery[dish.cuisine])] >= LEVEL_RANK[dish.unlock];
}

export function unlockedDishes(mastery: Mastery): Dish[] {
  return DISHES.filter((dish) => isDishUnlocked(mastery, dish));
}

export function confidentCuisines(mastery: Mastery): number {
  return CUISINE_IDS.filter((cuisine) => mastery[cuisine] >= CAREER.confidentMastery).length;
}

export function emptyMastery(points: number): Mastery {
  return {
    italian: points,
    indian: points,
    japanese: points,
    mexican: points,
    french: points,
    "west-african": points,
  };
}

export function addMastery(state: GameState, cuisine: CuisineId, gain: number): GameState {
  if (gain <= 0) return state;
  const points = Math.min(MAX_MASTERY, state.mastery[cuisine] + gain);
  const pin: AwardId = `mentor-pin-${cuisine}`;
  const pinned = points >= CAREER.expertMastery && !state.awards.includes(pin);
  return {
    ...state,
    mastery: { ...state.mastery, [cuisine]: points },
    awards: pinned ? [...state.awards, pin] : state.awards,
  };
}
