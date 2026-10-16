import type { RoomColour } from "../content/roomColour";
import { NEUTRAL_TAG, type RoomTag } from "../content/roomTag";
import type { Brief } from "./brief";
import { floorById, furnitureById, paintById } from "./catalog";
import { pieceColour } from "./roomColours";
import { sourcePaints, type RoomSource } from "./roomSource";

interface FitItem {
  readonly tags: readonly RoomTag[];
  readonly colours: readonly RoomColour[];
}

function fitItems(source: RoomSource): FitItem[] {
  const paints = sourcePaints(source).map((id) => paintById(id));
  return [
    ...source.pieces.map((piece) => {
      const def = furnitureById(piece.furnitureId);
      return { tags: def.tags, colours: [pieceColour(def.colour, source)] };
    }),
    ...paints.map((paint) => ({ tags: paint.tags, colours: [paint.colour] })),
    ...(source.floor === null ? [] : [floorById(source.floor)]).map((floor) => ({
      tags: floor.tags,
      colours: floor.colours,
    })),
  ];
}

function itemFits(item: FitItem, brief: Brief): boolean {
  const tagged = item.tags.some((tag) => tag === NEUTRAL_TAG || brief.requiredTags.includes(tag));
  return tagged && !item.colours.some((colour) => brief.avoidColours.includes(colour));
}

export function roomFit(source: RoomSource, brief: Brief): number {
  const items = fitItems(source);
  if (items.length === 0) return 0;
  return items.filter((item) => itemFits(item, brief)).length / items.length;
}
