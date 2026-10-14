import type { MustHave } from "../content/client";
import { isDecorId, isFurnitureId, itemName } from "./catalog";
import type { RoomSource } from "./roomSource";

export interface MustHaveCount {
  readonly need: MustHave;
  readonly name: string;
  readonly placed: number;
}

function mustHaveCount(source: RoomSource, need: MustHave): number {
  if (isFurnitureId(need.itemId))
    return source.pieces.filter((piece) => piece.furnitureId === need.itemId).length;
  if (isDecorId(need.itemId)) return source.decor.filter((id) => id === need.itemId).length;
  return source.lights.filter((id) => id === need.itemId).length;
}

export function mustHaveCounts(source: RoomSource, needs: readonly MustHave[]): MustHaveCount[] {
  return needs.map((need) => ({ need, name: itemName(need.itemId), placed: mustHaveCount(source, need) }));
}
