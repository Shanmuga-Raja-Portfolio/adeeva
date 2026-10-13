import { earnedReputation } from "../../engine/earnedReputation";
import type { GameModule } from "../../studio/gameModule";
import { CAREERS } from "./content/career";
import { SCHEMA_VERSION } from "./core/gameState";
import { AdeevaTileArt } from "./ui/AdeevaTileArt";

function careerReputation(rawSave: unknown): number {
  return earnedReputation(rawSave, SCHEMA_VERSION, (profile) => {
    const career = CAREERS.find((entry) => entry.id === profile.career);
    return career === undefined ? null : career.startReputation;
  });
}

export const adeevaModule: GameModule = {
  status: "live",
  id: "adeeva",
  title: "ADEEVA",
  tagline: "Design, cut and sew dresses for clients, then launch your own label.",
  ages: "8+",
  tileArt: AdeevaTileArt,
  load: () => import("./ui/AdeevaGame").then((module) => ({ default: module.AdeevaGame })),
  reputationOf: careerReputation,
};
