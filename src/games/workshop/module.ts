import { earnedReputation } from "../../engine/earnedReputation";
import type { GameModule } from "../../studio/gameModule";
import { CAREERS } from "./content/career";
import { SCHEMA_VERSION } from "./core/gameState";
import { WorkshopTileArt } from "./ui/WorkshopTileArt";

function startReputationOf(profile: Readonly<Record<string, unknown>>): number | null {
  if (profile.startedAs === undefined) return 0;
  return CAREERS.find((career) => career.id === profile.startedAs)?.startReputation ?? null;
}

export const workshopModule: GameModule = {
  id: "workshop",
  title: "Workshop & Wood",
  tagline:
    "Build furniture for your neighbours, then open a showroom and bring matched sets to the Craft Fair.",
  ages: "8+",
  tileArt: WorkshopTileArt,
  load: () => import("./ui/WorkshopGame").then((module) => ({ default: module.WorkshopGame })),
  reputationOf: (rawSave) => earnedReputation(rawSave, SCHEMA_VERSION, startReputationOf),
  parentNote:
    "This game does not teach real woodworking, tool use or finishing. It uses no real measurements or plans.",
};
