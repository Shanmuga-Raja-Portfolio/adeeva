import type { Season } from "./path";

export function newSeason(startDay: number): Season {
  return { startDay, scores: [], critics: [], moneyIn: 0, moneyOut: 0, ingredients: 0, unserved: 0 };
}
