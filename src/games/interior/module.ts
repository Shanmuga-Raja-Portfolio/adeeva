import { traitGatedReputation } from "../../engine/earnedReputation";
import type { GameModule } from "../../studio/gameModule";
import { CAREER } from "./content/career";
import { SCHEMA_VERSION } from "./core/gameState";
import { InteriorTileArt } from "./ui/InteriorTileArt";

export const interiorModule: GameModule = {
  id: "interior",
  title: "Interior Studio",
  tagline: "Turn empty rooms into places people love.",
  ages: "8–15+",
  tileArt: InteriorTileArt,
  load: () => import("./ui/InteriorGame").then((module) => ({ default: module.InteriorGame })),
  reputationOf: traitGatedReputation(SCHEMA_VERSION, CAREER.startReputation),
  parentNote:
    "This game does not teach real painting, DIY, ladder use or electrical work. Its rooms and sizes are made up.",
};
