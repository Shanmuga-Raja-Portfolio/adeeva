import { earnedReputation, traitGatedStart } from "../../engine/earnedReputation";
import type { GameModule } from "../../studio/gameModule";
import { ThriftFlipTileArt } from "../../ui/art/tiles/ThriftFlipTileArt";
import { CAREER } from "./content/career";
import { SCHEMA_VERSION } from "./core/gameState";

export const thriftFlipModule: GameModule = {
  status: "live",
  id: "thrift-flip",
  title: "Thrift-Flip Studio",
  tagline: "Find secondhand treasures, unpick and redesign them, then resell them at your own stall.",
  ages: "8+",
  tileArt: ThriftFlipTileArt,
  load: () => import("./ui/ThriftFlipGame").then((module) => ({ default: module.ThriftFlipGame })),
  reputationOf: (rawSave) =>
    earnedReputation(rawSave, SCHEMA_VERSION, traitGatedStart(CAREER.startReputation)),
  parentNote: "This game does not teach real sewing, washing or tool use.",
};
