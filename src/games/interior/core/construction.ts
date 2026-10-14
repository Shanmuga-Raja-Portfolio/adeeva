import { WALL_IDS } from "../content/roomTemplate";
import { FLOOR_PIECES, laidCount } from "./floorLay";
import { placedLights } from "./lightPlacement";
import type { MakeoverRun } from "./makeoverRun";
import { isWallDone } from "./paintScore";

export interface ConstructionCount {
  readonly walls: number;
  readonly wallsDone: number;
  readonly floorPieces: number;
  readonly floorLaid: number;
  readonly lights: number;
}

export function constructionCount(run: MakeoverRun): ConstructionCount {
  return {
    walls: WALL_IDS.length,
    wallsDone: WALL_IDS.filter((wall) => isWallDone(run, wall)).length,
    floorPieces: FLOOR_PIECES,
    floorLaid: laidCount(run),
    lights: placedLights(run).length,
  };
}

export function isConstructionComplete(count: ConstructionCount): boolean {
  return count.wallsDone === count.walls && count.floorLaid === count.floorPieces && count.lights > 0;
}
