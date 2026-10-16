import type { RoomTemplate } from "../content/roomTemplate";
import { plotById, roomById } from "./catalog";
import type { MakeoverRun } from "./makeoverRun";

export function runRoom(run: Pick<MakeoverRun, "brief" | "purpose">): RoomTemplate {
  const room = roomById(run.brief.roomId);
  if (run.purpose.kind !== "home-room") return room;
  const space = plotById(run.purpose.plotId).spaces[run.purpose.roomIndex];
  return space === undefined ? room : { ...room, throughRow: space.throughRow };
}
