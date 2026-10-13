import { difficultyDef, type DifficultyDef } from "../../../engine/difficulty";

export const DIFFICULTIES: readonly DifficultyDef[] = [
  difficultyDef({
    id: "relaxed",
    name: "Relaxed",
    description: "No rent and every order makes someone happy. Counter Day has no clock.",
  }),
  difficultyDef({
    id: "standard",
    name: "Standard",
    description: "Rent is due each week. A near miss still pays part of the fee, with kind notes.",
  }),
  difficultyDef({
    id: "challenging",
    name: "Challenging",
    description: "Higher rent and pickier neighbours. A missed order pays nothing and late bakes cost half.",
  }),
];
