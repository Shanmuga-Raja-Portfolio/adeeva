import type { FurnitureId } from "../../content/furniture";
import type { LightId } from "../../content/light";
import type { RoomId } from "../../content/roomTemplate";
import { bestLightCell, roomById, tidyLayout, type PlacedLight, type PlacedPiece } from "../../core";
import { roomHex } from "./roomHex";
import type { RoomLook } from "./roomLook";

interface Showcase {
  readonly roomId: RoomId;
  readonly back: string;
  readonly side: string;
  readonly floor: RoomLook["floor"];
  readonly furniture: readonly FurnitureId[];
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
    lights: ["arc-lamp", "paper-pendant"],
    soft: roomHex("coral"),
  },
  {
    roomId: "shared-bedroom",
    back: roomHex("mustard"),
    side: roomHex("sky"),
    floor: "pine-boards",
    furniture: ["bunk-bed", "toy-box", "desk"],
    lights: ["firefly-string", "paper-pendant"],
    soft: roomHex("teal"),
  },
  {
    roomId: "attic-room",
    back: roomHex("lavender"),
    side: roomHex("navy"),
    floor: "checkerboard",
    furniture: ["single-bed", "desk"],
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

export const SHOWCASE_LOOKS: readonly RoomLook[] = SHOWCASES.flatMap((showcase) => {
  const pieces = tidyLayout(
    roomById(showcase.roomId),
    showcase.furniture.map((furnitureId, index) => ({ id: `show-${index}`, furnitureId })),
  );
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
    decor: [],
  };
});
