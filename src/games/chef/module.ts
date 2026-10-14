import { earnedReputation } from "../../engine/earnedReputation";
import { TRAIT_IDS } from "../../engine/trait";
import type { GameModule } from "../../studio/gameModule";
import { SAFETY_NOTE } from "./content/safetyNote";
import { START_REPUTATION } from "./content/startReputation";
import { SCHEMA_VERSION } from "./core/gameState";
import { ChefTileArt } from "./ui/ChefTileArt";

function chefReputation(rawSave: unknown): number {
  return earnedReputation(rawSave, SCHEMA_VERSION, (profile) => {
    if (!TRAIT_IDS.some((trait) => trait === profile.trait)) return null;
    if (profile.start === "student") return START_REPUTATION.student;
    return profile.start === "head" ? START_REPUTATION.head : null;
  });
}

export const chefModule: GameModule = {
  id: "chef",
  title: "Six Kitchens",
  tagline: "Cook your way from student to head chef, then choose your own kitchen.",
  ages: "8–15+",
  tileArt: ChefTileArt,
  load: () => import("./ui/ChefGame").then((module) => ({ default: module.ChefGame })),
  reputationOf: chefReputation,
  parentNote: SAFETY_NOTE,
};
