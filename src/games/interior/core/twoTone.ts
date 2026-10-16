import type { WallId } from "../content/roomTemplate";
import type { MakeoverRun, RollerZone } from "./makeoverRun";

export const TWO_TONE_WALL: WallId = "back";
export const TOP_ZONE_ROWS = 3;

export function isTwoTone(run: Pick<MakeoverRun, "plan">): boolean {
  return run.plan.lowerPaint !== null;
}

export function cellZone(row: number): RollerZone {
  return row < TOP_ZONE_ROWS ? "top" : "bottom";
}

export function zonedWall(run: Pick<MakeoverRun, "plan">, wall: WallId): boolean {
  return isTwoTone(run) && wall === TWO_TONE_WALL;
}
