import type { GameModule } from "../../studio/gameModule";
import { reputationOf } from "./reputationOf";
import { WorkshopTileArt } from "./ui/WorkshopTileArt";

export const workshopModule: GameModule = {
  status: "live",
  id: "workshop",
  title: "Workshop & Wood",
  tagline: "Plan furniture from parts, cut with the grain, then saw, join, sand and deliver.",
  ages: "8+",
  tileArt: WorkshopTileArt,
  load: () => import("./ui/WorkshopGame").then((module) => ({ default: module.WorkshopGame })),
  reputationOf,
  parentNote:
    "This game does not teach real woodworking, tool use or finishing. It uses no real measurements or plans.",
};
