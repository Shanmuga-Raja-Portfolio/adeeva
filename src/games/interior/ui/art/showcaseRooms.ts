import type { DecorId } from "../../content/decor";
import type { FurnitureId } from "../../content/furniture";
import type { LightId } from "../../content/light";
import type { RoomId } from "../../content/roomTemplate";
import {
  bestLightCell,
  roomById,
  tidyLayout,
  type PlacedDecor,
  type PlacedLight,
  type PlacedPiece,
} from "../../core";
import { cutawayFrame, floorPoint, lifted } from "./cutawayFrame";
import { roomHex } from "./roomHex";
import type { RoomLook } from "./roomLook";

interface ShowcaseDecor {
  readonly decorId: DecorId;
  readonly col: number;
  readonly row: number;
  readonly lift: number;
}

interface Showcase {
  readonly roomId: RoomId;
  readonly back: string;
  readonly side: string;
  readonly floor: RoomLook["floor"];
  readonly furniture: readonly FurnitureId[];
  readonly extras: readonly FurnitureId[];
  readonly decor: readonly ShowcaseDecor[];
  readonly lights: readonly LightId[];
  readonly soft: string;
}

const SHOWCASES: readonly Showcase[] = [
  {
    roomId: "reading-nook",
    back: roomHex("sage"),
    side: roomHex("ivory"),
    floor: "cork-tiles",
    furniture: ["armchair", "bookcase"],
    extras: ["plant-stand"],
    decor: [
      { decorId: "framed-print", col: 1.3, row: 0, lift: 0.62 },
      { decorId: "book-stack", col: 3.9, row: 3.3, lift: 0 },
    ],
    lights: ["arc-lamp", "paper-pendant"],
    soft: roomHex("coral"),
  },
  {
    roomId: "shared-bedroom",
    back: roomHex("mustard"),
    side: roomHex("sky"),
    floor: "pine-boards",
    furniture: ["bunk-bed", "toy-box", "desk"],
    extras: ["bean-bag"],
    decor: [
      { decorId: "star-garland", col: 3, row: 0, lift: 0.84 },
      { decorId: "map-poster", col: 4.8, row: 0, lift: 0.58 },
    ],
    lights: ["firefly-string", "paper-pendant"],
    soft: roomHex("teal"),
  },
  {
    roomId: "attic-room",
    back: roomHex("lavender"),
    side: roomHex("navy"),
    floor: "checkerboard",
    furniture: ["single-bed", "desk"],
    extras: ["desk-chair"],
    decor: [
      { decorId: "paper-bunting", col: 2.4, row: 0, lift: 0.82 },
      { decorId: "record-frame", col: 4.6, row: 0, lift: 0.58 },
      { decorId: "potted-fern", col: 5.4, row: 4.2, lift: 0 },
    ],
    lights: ["firefly-string", "brass-sconce"],
    soft: roomHex("mustard"),
  },
];

function lightsFor(
  roomId: RoomId,
  pieces: readonly PlacedPiece[],
  lights: readonly LightId[],
): PlacedLight[] {
  const placed: PlacedLight[] = [];
  for (const lightId of lights) {
    const cell = bestLightCell(roomById(roomId), pieces, placed, lightId);
    if (cell !== null) placed.push({ lightId, col: cell[0], row: cell[1] });
  }
  return placed;
}

function decorFor(showcase: Showcase): PlacedDecor[] {
  const frame = cutawayFrame(roomById(showcase.roomId));
  return showcase.decor.map((item, index) => {
    const [x, y] = lifted(floorPoint(frame, item.col, item.row), frame.wall * item.lift);
    return {
      id: `show-decor-${index}`,
      decorId: item.decorId,
      x: Math.round(x),
      y: Math.round(y),
      rotation: 0,
      scale: 1,
      layer: item.lift > 0 ? index + 10 : index,
    };
  });
}

function layout(showcase: Showcase, ids: readonly FurnitureId[]): PlacedPiece[] | null {
  return tidyLayout(
    roomById(showcase.roomId),
    ids.map((furnitureId, index) => ({ id: `show-${index}`, furnitureId })),
  );
}

export const SHOWCASE_LOOKS: readonly RoomLook[] = SHOWCASES.flatMap((showcase) => {
  const pieces =
    layout(showcase, [...showcase.furniture, ...showcase.extras]) ?? layout(showcase, showcase.furniture);
  if (pieces === null) return [];
  return {
    roomId: showcase.roomId,
    backWall: showcase.back,
    backLower: null,
    sideWall: showcase.side,
    floor: showcase.floor,
    pieces,
    soft: showcase.soft,
    lights: lightsFor(showcase.roomId, pieces, showcase.lights),
    decor: decorFor(showcase),
  };
});
