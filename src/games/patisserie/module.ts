import { fixedStartReputation } from "../../engine/earnedReputation";
import type { GameModule } from "../../studio/gameModule";
import { CAREER } from "./content/career";
import { SCHEMA_VERSION } from "./core/gameState";
import { PatisserieTileArt } from "./ui/PatisserieTileArt";

export const patisserieModule: GameModule = {
  id: "patisserie",
  title: "Patisserie Atelier",
  tagline: "Bake, pipe and decorate cakes for your neighbours, then box up treats on Counter Day.",
  ages: "8+",
  tileArt: PatisserieTileArt,
  load: () => import("./ui/PatisserieGame").then((module) => ({ default: module.PatisserieGame })),
  reputationOf: fixedStartReputation(SCHEMA_VERSION, CAREER.startReputation),
};
