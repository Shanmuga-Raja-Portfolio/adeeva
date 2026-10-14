import { earnedReputation, traitGatedStart } from "../../engine/earnedReputation";
import type { GameModule } from "../../studio/gameModule";
import { CAREER } from "./content/career";
import { SCHEMA_VERSION } from "./core/gameState";
import { JewelleryTileArt } from "./ui/JewelleryTileArt";

export const jewelleryModule: GameModule = {
  status: "live",
  id: "jewellery",
  title: "Jewellery Bench",
  tagline: "Cut, join and set tiny treasures.",
  ages: "8–15+",
  tileArt: JewelleryTileArt,
  load: () => import("./ui/JewelleryGame").then((module) => ({ default: module.JewelleryGame })),
  reputationOf: (rawSave) =>
    earnedReputation(rawSave, SCHEMA_VERSION, traitGatedStart(CAREER.startReputation)),
  parentNote:
    "This game does not teach real jewellery making, soldering or tool use. Metals and stones are game items with no real prices or values.",
};
