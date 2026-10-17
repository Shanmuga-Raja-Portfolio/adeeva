import type { Point } from "../../../../engine/geometry/point";
import { colourById } from "../../../../engine/palette";
import { mixHex } from "../../../../ui/art/colourMix";
import { jewelColourById } from "../../content/jewelColour";
import { STONE_TINT_DEFS, type StoneTint } from "../../content/stoneTint";
import { stoneById, type PieceSource } from "../../core";
import type { MetalLook } from "./metalLook";

export interface PieceArtProps {
  readonly source: PieceSource;
  readonly metal: MetalLook;
  readonly fill: string;
  readonly sheen: string;
  readonly twinkle: boolean;
}

export function glazeHex(source: PieceSource): string | null {
  return source.glaze === null ? null : colourById(source.glaze).hex;
}

export function cordHex(source: PieceSource): string {
  return source.cordColour === null ? "#b9a7dc" : colourById(source.cordColour).hex;
}

export function tintedHex(hex: string, tint: StoneTint | null | undefined): string {
  const def = STONE_TINT_DEFS.find((entry) => entry.id === tint);
  return def === undefined || def.mix === 0 ? hex : mixHex(hex, def.towards, def.mix);
}

export function stoneHex(source: PieceSource): string | null {
  if (source.stoneId === null) return null;
  return tintedHex(jewelColourById(stoneById(source.stoneId).colour).hex, source.stoneTint);
}

export function fitPoints(points: readonly Point[], width: number, height: number, box: number): Point[] {
  const scale = box / Math.max(width, height);
  return points.map(([x, y]): Point => [(x - width / 2) * scale, (y - height / 2) * scale]);
}
