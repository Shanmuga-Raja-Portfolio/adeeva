import { difficultyDef, type DifficultyDef } from "../../../engine/difficulty";

export const DIFFICULTIES: readonly DifficultyDef[] = [
  difficultyDef({
    id: "relaxed",
    name: "Relaxed",
    description: "No rent, and every reveal makes someone smile. Wide edges and gentle floors.",
  }),
  difficultyDef({
    id: "standard",
    name: "Standard",
    description: "Rent is due each week. A near miss still pays part of the fee, with kind notes.",
  }),
  difficultyDef({
    id: "challenging",
    name: "Challenging",
    description: "Higher rent and pickier clients. A missed brief pays nothing and late rooms cost half.",
  }),
];
