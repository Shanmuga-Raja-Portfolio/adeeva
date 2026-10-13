import { difficultyDef, type DifficultyDef } from "../../../engine/difficulty";

export const DIFFICULTIES: readonly DifficultyDef[] = [
  difficultyDef({
    id: "relaxed",
    name: "Relaxed",
    description: "No rent and no failed gigs. Every dress finds a happy owner.",
  }),
  difficultyDef({
    id: "standard",
    name: "Standard",
    description: "Rent is due weekly. A near miss still pays part of the fee, with kind feedback.",
  }),
  difficultyDef({
    id: "challenging",
    name: "Challenging",
    description:
      "Higher rent and pickier clients. A failed gig pays nothing and late work costs half the fee.",
  }),
];
