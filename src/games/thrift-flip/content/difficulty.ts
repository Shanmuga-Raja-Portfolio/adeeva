import { difficultyDef, type DifficultyDef } from "../../../engine/difficulty";

export const DIFFICULTIES: readonly DifficultyDef[] = [
  difficultyDef({
    id: "relaxed",
    name: "Relaxed",
    description: "No stall rent and every flip finds a happy owner. Gentle tools for every step.",
  }),
  difficultyDef({
    id: "standard",
    name: "Standard",
    description: "Stall rent each week. A near miss still pays part of the fee, with kind words.",
  }),
  difficultyDef({
    id: "challenging",
    name: "Challenging",
    description: "Higher rent and pickier regulars. A missed brief pays nothing, and late work pays half.",
  }),
];
