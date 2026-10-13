import type { GameModule } from "../../studio/gameModule";
import { reputationOf } from "./reputationOf";
import { PatisserieTileArt } from "./ui/PatisserieTileArt";

export const patisserieModule: GameModule = {
  status: "live",
  id: "patisserie",
  title: "Patisserie Atelier",
  tagline: "Bake, pipe and decorate cakes for your neighbours, then box up treats on Counter Day.",
  ages: "8+",
  tileArt: PatisserieTileArt,
  load: () => import("./ui/PatisserieGame").then((module) => ({ default: module.PatisserieGame })),
  reputationOf,
};
