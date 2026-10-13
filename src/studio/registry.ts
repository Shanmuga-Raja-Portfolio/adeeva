import { adeevaModule } from "../games/adeeva/module";
import { InteriorTileArt } from "../ui/art/tiles/InteriorTileArt";
import { JewelleryTileArt } from "../ui/art/tiles/JewelleryTileArt";
import { PatisserieTileArt } from "../ui/art/tiles/PatisserieTileArt";
import { ThriftFlipTileArt } from "../ui/art/tiles/ThriftFlipTileArt";
import { WoodTileArt } from "../ui/art/tiles/WoodTileArt";
import type { GameId, GameModule, StudioGame } from "./gameModule";

export const GAMES: readonly StudioGame[] = [
  adeevaModule,
  {
    status: "workshop",
    id: "thrift-flip",
    title: "Thrift-Flip Studio",
    tagline: "Find secondhand treasures, unpick and redesign them, then resell them at your own stall.",
    ages: "8+",
    tileArt: ThriftFlipTileArt,
  },
  {
    status: "workshop",
    id: "patisserie",
    title: "Patisserie Atelier",
    tagline: "Design tiered cakes, bake by temperature and time, pipe the finish and run a bakery counter.",
    ages: "8+",
    tileArt: PatisserieTileArt,
  },
  {
    status: "workshop",
    id: "workshop",
    title: "Workshop & Wood",
    tagline: "Plan furniture from parts, cut with the grain, then saw, join, sand and deliver.",
    ages: "8+",
    tileArt: WoodTileArt,
  },
  {
    status: "workshop",
    id: "interior",
    title: "Interior Studio",
    tagline:
      "Place furniture on a floor plan, pick paint, floors and lights on a budget, then reveal the room.",
    ages: "8+",
    tileArt: InteriorTileArt,
  },
  {
    status: "workshop",
    id: "jewellery",
    title: "Jewellery Bench",
    tagline: "Design rings and pendants, saw, solder and set stones, then build a market-stall collection.",
    ages: "8+",
    tileArt: JewelleryTileArt,
  },
];

export const LIVE_GAMES: readonly GameModule[] = GAMES.filter((game) => game.status === "live");

export function liveGame(id: GameId): GameModule | null {
  return LIVE_GAMES.find((game) => game.id === id) ?? null;
}
