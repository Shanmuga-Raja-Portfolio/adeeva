import type { Point } from "./point";
import type { Rotation } from "./rotation";

export interface Bounds {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

const COORDINATE_PRECISION = 1e6;

function roundCoordinate(value: number): number {
  return Math.round(value * COORDINATE_PRECISION) / COORDINATE_PRECISION;
}

export function polygonBounds(points: readonly Point[]): Bounds {
  if (points.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
}

export function rotatedShape(shape: readonly Point[], rotation: Rotation): Point[] {
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const turned = shape.map(([x, y]): Point => [x * cos - y * sin, x * sin + y * cos]);
  const bounds = polygonBounds(turned);
  return turned.map(([x, y]): Point => [roundCoordinate(x - bounds.minX), roundCoordinate(y - bounds.minY)]);
}

export function placedPolygon(
  shape: readonly Point[],
  placement: { readonly x: number; readonly y: number; readonly rotation: Rotation },
): Point[] {
  return rotatedShape(shape, placement.rotation).map(([x, y]): Point => [
    roundCoordinate(x + placement.x),
    roundCoordinate(y + placement.y),
  ]);
}
