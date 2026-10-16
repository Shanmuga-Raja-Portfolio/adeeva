import { ROOM_TAGS, type RoomTag } from "../content/roomTag";
import { decorById, floorById, furnitureById, lightById, paintById } from "./catalog";
import { sourcePaints, type RoomSource } from "./roomSource";

export function roomTags(source: RoomSource): RoomTag[] {
  const paints = sourcePaints(source);
  const tags = new Set<RoomTag>([
    ...source.pieces.flatMap((piece) => furnitureById(piece.furnitureId).tags),
    ...paints.flatMap((id) => paintById(id).tags),
    ...(source.floor === null ? [] : floorById(source.floor).tags),
    ...source.lights.flatMap((id) => lightById(id).tags),
    ...source.decor.flatMap((id) => decorById(id).tags),
  ]);
  return ROOM_TAGS.filter((tag) => tags.has(tag));
}
