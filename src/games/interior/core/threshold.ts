import type { FloorId } from "../content/floor";
import { floorById } from "./catalog";
import type { MakeoverRun } from "./makeoverRun";

export const THRESHOLD_PIECES = 3;

export function thresholdFloor(run: Pick<MakeoverRun, "purpose" | "plan">): FloorId | null {
  if (run.purpose.kind !== "home-room") return null;
  const hall = run.purpose.hallFloor;
  const floor = run.plan.floor;
  if (hall === null || floor === null || hall === floor) return null;
  return floorById(hall).pattern === floorById(floor).pattern ? hall : null;
}
