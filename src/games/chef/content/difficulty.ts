import { difficultyDef, type DifficultyDef } from "../../../engine/difficulty";

export const DIFFICULTIES: readonly DifficultyDef[] = [
  difficultyDef({
    id: "relaxed",
    name: "Relaxed",
    description: "No rent and no service clock. Tickets wait for you, and every plate makes someone smile.",
  }),
  difficultyDef({
    id: "standard",
    name: "Standard",
    description:
      "Board and rent each week, and a gentle service clock. A near miss still pays part of the fee.",
  }),
  difficultyDef({
    id: "challenging",
    name: "Challenging",
    description: "Higher rent, a quicker beat and a shorter service. A missed order pays nothing.",
  }),
];
