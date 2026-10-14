import { fixedStartReputation } from "../../engine/earnedReputation";
import type { GameModule } from "../../studio/gameModule";
import { CAREER } from "./content/career";
import { SCHEMA_VERSION } from "./core/gameState";
import { WorkshopTileArt } from "./ui/WorkshopTileArt";

export const workshopModule: GameModule = {
  id: "workshop",
  title: "Workshop & Wood",
  tagline: "Plan furniture from parts, cut with the grain, then saw, join, sand and deliver.",
  ages: "8+",
  tileArt: WorkshopTileArt,
  load: () => import("./ui/WorkshopGame").then((module) => ({ default: module.WorkshopGame })),
  reputationOf: fixedStartReputation(SCHEMA_VERSION, CAREER.startReputation),
  parentNote:
    "This game does not teach real woodworking, tool use or finishing. It uses no real measurements or plans.",
};
