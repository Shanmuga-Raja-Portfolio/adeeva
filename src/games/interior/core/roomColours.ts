import { ROOM_COLOUR_IDS, type RoomColour } from "../content/roomColour";
import { decorById, floorById, furnitureById, lightById, paintById } from "./catalog";
import type { RoomSource } from "./roomSource";

function resolved(colour: RoomColour | "soft", source: RoomSource): RoomColour {
  return colour === "soft" ? source.softColour : colour;
}

function ordered(colours: Iterable<RoomColour>): RoomColour[] {
  const set = new Set(colours);
  return ROOM_COLOUR_IDS.filter((id) => set.has(id));
}

function hasSoftPieces(source: RoomSource): boolean {
  return (
    source.pieces.some((piece) => furnitureById(piece.furnitureId).colour === "soft") ||
    source.decor.some((id) => decorById(id).colour === "soft")
  );
}

export function surfaceColours(source: RoomSource): RoomColour[] {
  const paints = [source.wallPaint, source.featurePaint].flatMap((id) =>
    id === null ? [] : [paintById(id).colour],
  );
  return ordered([
    ...paints,
    ...(source.floor === null ? [] : floorById(source.floor).colours),
    ...(hasSoftPieces(source) ? [source.softColour] : []),
  ]);
}

export function roomColours(source: RoomSource): RoomColour[] {
  return ordered([
    ...surfaceColours(source),
    ...source.pieces.map((piece) => resolved(furnitureById(piece.furnitureId).colour, source)),
    ...source.lights.map((id) => lightById(id).colour),
    ...source.decor.map((id) => resolved(decorById(id).colour, source)),
  ]);
}

export function pieceColour(colour: RoomColour | "soft", source: RoomSource): RoomColour {
  return resolved(colour, source);
}
