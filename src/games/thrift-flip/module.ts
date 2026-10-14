import { earnedReputation, traitGatedStart } from "../../engine/earnedReputation";
import type { GameModule } from "../../studio/gameModule";
import { ThriftFlipTileArt } from "../../ui/art/tiles/ThriftFlipTileArt";
import { CAREERS } from "./content/career";
import { SCHEMA_VERSION } from "./core/gameState";

function careerReputation(rawSave: unknown): number {
  return earnedReputation(rawSave, SCHEMA_VERSION, (profile) => {
    const careerId = profile.career === undefined ? "stall" : profile.career;
    const career = CAREERS.find((entry) => entry.id === careerId);
    return career === undefined ? null : traitGatedStart(career.startReputation)(profile);
  });
}

export const thriftFlipModule: GameModule = {
  id: "thrift-flip",
  title: "Thrift-Flip Studio",
  tagline: "Find secondhand treasures, unpick and redesign them, then resell them at your own stall.",
  ages: "8+",
  tileArt: ThriftFlipTileArt,
  load: () => import("./ui/ThriftFlipGame").then((module) => ({ default: module.ThriftFlipGame })),
  reputationOf: careerReputation,
  parentNote: "This game does not teach real sewing, washing or tool use.",
};
