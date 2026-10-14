import { earnedReputation } from "../../engine/earnedReputation";
import type { GameModule } from "../../studio/gameModule";
import { CAREERS } from "./content/career";
import { SCHEMA_VERSION } from "./core/gameState";
import { PatisserieTileArt } from "./ui/PatisserieTileArt";

function startReputationOf(profile: Readonly<Record<string, unknown>>): number | null {
  if (profile.startedAs === undefined) return 0;
  return CAREERS.find((career) => career.id === profile.startedAs)?.startReputation ?? null;
}

export const patisserieModule: GameModule = {
  id: "patisserie",
  title: "Patisserie Atelier",
  tagline: "Bake for your neighbours, run a tea salon and win ribbons at the glasshouse Fair.",
  ages: "8+",
  tileArt: PatisserieTileArt,
  load: () => import("./ui/PatisserieGame").then((module) => ({ default: module.PatisserieGame })),
  reputationOf: (rawSave) => earnedReputation(rawSave, SCHEMA_VERSION, startReputationOf),
};
