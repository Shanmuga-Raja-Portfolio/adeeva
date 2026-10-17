import { earnedReputation, traitGatedStart } from "../../engine/earnedReputation";
import type { GameModule } from "../../studio/gameModule";
import { CAREERS } from "./content/career";
import { SCHEMA_VERSION } from "./core/gameState";
import { JewelleryTileArt } from "./ui/JewelleryTileArt";

const traitStart = traitGatedStart(0);

function startReputationOf(profile: Readonly<Record<string, unknown>>): number | null {
  if (traitStart(profile) === null) return null;
  if (profile.startedAs === undefined) return 0;
  return CAREERS.find((career) => career.id === profile.startedAs)?.startReputation ?? null;
}

export const jewelleryModule: GameModule = {
  id: "jewellery",
  title: "Jewellery Bench",
  tagline: "Cut, join and set tiny treasures.",
  ages: "8–15+",
  tileArt: JewelleryTileArt,
  load: () => import("./ui/JewelleryGame").then((module) => ({ default: module.JewelleryGame })),
  reputationOf: (rawSave) => earnedReputation(rawSave, SCHEMA_VERSION, startReputationOf),
  parentNote:
    "This game does not teach real jewellery making, soldering or tool use. Metals and stones are game items with no real prices or values.",
};
