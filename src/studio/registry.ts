import { adeevaModule } from "../games/adeeva/module";
import { chefModule } from "../games/chef/module";
import { interiorModule } from "../games/interior/module";
import { jewelleryModule } from "../games/jewellery/module";
import { patisserieModule } from "../games/patisserie/module";
import { thriftFlipModule } from "../games/thrift-flip/module";
import { workshopModule } from "../games/workshop/module";
import type { GameId, GameModule } from "./gameModule";

export const GAMES: readonly GameModule[] = [
  adeevaModule,
  thriftFlipModule,
  patisserieModule,
  workshopModule,
  interiorModule,
  jewelleryModule,
  chefModule,
];

export function liveGame(id: GameId): GameModule | null {
  return GAMES.find((game) => game.id === id) ?? null;
}
