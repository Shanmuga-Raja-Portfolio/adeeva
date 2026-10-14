import type { Point } from "../../../../../engine/geometry/point";
import { BOLT_WIDTH_CM } from "../../../core/piecePlacementIssues";
import { polygonBounds, rotatedShape } from "../../../../../engine/geometry/polygonPlacement";
import { ROTATIONS, type Rotation } from "../../../../../engine/geometry/rotation";

export interface PieceSize {
  readonly width: number;
  readonly height: number;
}

export function rotatedSize(shape: readonly Point[], rotation: Rotation): PieceSize {
  const bounds = polygonBounds(rotatedShape(shape, rotation));
  return { width: bounds.maxX - bounds.minX, height: bounds.maxY - bounds.minY };
}

export function artOffset(shape: readonly Point[], rotation: Rotation): { x: number; y: number } {
  const raw = polygonBounds(shape);
  const cx = (raw.minX + raw.maxX) / 2;
  const cy = (raw.minY + raw.maxY) / 2;
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  let minX = Infinity;
  let minY = Infinity;
  for (const [px, py] of shape) {
    const dx = px - cx;
    const dy = py - cy;
    minX = Math.min(minX, cx + dx * cos - dy * sin);
    minY = Math.min(minY, cy + dx * sin + dy * cos);
  }
  return { x: -minX, y: -minY };
}

export function snapCm(value: number): number {
  return Math.round(value * 2) / 2;
}

export function clampToBoltWidth(x: number, width: number): number {
  return Math.min(Math.max(0, BOLT_WIDTH_CM - width), Math.max(0, x));
}

export function turned(rotation: Rotation, steps: number): Rotation {
  const index = ROTATIONS.indexOf(rotation);
  const count = ROTATIONS.length;
  return ROTATIONS[(((index + steps) % count) + count) % count] ?? 0;
}

export function rotateInPlace(
  shape: readonly Point[],
  placement: { readonly x: number; readonly y: number; readonly rotation: Rotation },
  next: Rotation,
): { x: number; y: number } {
  const before = rotatedSize(shape, placement.rotation);
  const after = rotatedSize(shape, next);
  const tidy = (value: number) => Math.round(value * 1e6) / 1e6;
  return {
    x: tidy(placement.x + (before.width - after.width) / 2),
    y: tidy(placement.y + (before.height - after.height) / 2),
  };
}
